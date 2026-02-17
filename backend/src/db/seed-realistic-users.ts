import { db } from './index.js';
import { users, orgs, apiKeys, providers, requests, billingEvents } from './schema/index.js';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

/**
 * Seed script to create realistic users with usage history
 * Creates 5 organizations with different usage patterns:
 * 1. Heavy User - High usage, multiple API keys
 * 2. Medium User - Moderate usage
 * 3. Light User - Occasional usage
 * 4. Enterprise User - Multiple team members, high volume
 * 5. Trial User - Just started, minimal usage
 */

interface RealisticRequest {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  daysAgo: number; // How many days ago this request happened
  hourOfDay?: number; // 0-23, if not specified, random
}

// Helper to generate random data within realistic bounds
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

// Generate timestamp for X days ago
function daysAgo(days: number, hour?: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  if (hour !== undefined) {
    date.setHours(hour, randomInt(0, 59), randomInt(0, 59));
  } else {
    date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  }
  return date;
}

// Calculate cost based on tokens and pricing
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  inputPrice: number,
  outputPrice: number
): number {
  // Prices are per 1M tokens, we need cost in cents
  const inputCost = (inputTokens / 1_000_000) * inputPrice * 100;
  const outputCost = (outputTokens / 1_000_000) * outputPrice * 100;
  return Number((inputCost + outputCost).toFixed(2));
}

// Generate realistic usage patterns
const usagePatterns = {
  heavy: (): RealisticRequest[] => {
    const requests: RealisticRequest[] = [];
    
    // Past 30 days, 50-150 requests per day
    for (let day = 0; day < 30; day++) {
      const numRequests = randomInt(50, 150);
      for (let i = 0; i < numRequests; i++) {
        requests.push({
          model: randomChoice(['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'gpt-4-turbo']),
          inputTokens: randomInt(500, 3000),
          outputTokens: randomInt(300, 2000),
          latencyMs: randomInt(500, 3000),
          status: Math.random() > 0.02 ? 'success' : 'error', // 2% error rate
          errorMessage: Math.random() > 0.98 ? 'Rate limit exceeded' : undefined,
          daysAgo: day,
        });
      }
    }
    return requests;
  },

  medium: (): RealisticRequest[] => {
    const requests: RealisticRequest[] = [];
    
    // Past 30 days, 10-30 requests per day
    for (let day = 0; day < 30; day++) {
      const numRequests = randomInt(10, 30);
      for (let i = 0; i < numRequests; i++) {
        requests.push({
          model: randomChoice(['gpt-4o-mini', 'gpt-3.5-turbo', 'claude-3-5-haiku-20241022']),
          inputTokens: randomInt(200, 1500),
          outputTokens: randomInt(150, 1000),
          latencyMs: randomInt(400, 2000),
          status: Math.random() > 0.01 ? 'success' : 'error',
          daysAgo: day,
        });
      }
    }
    return requests;
  },

  light: (): RealisticRequest[] => {
    const requests: RealisticRequest[] = [];
    
    // Past 30 days, 2-5 requests per day
    for (let day = 0; day < 30; day++) {
      if (Math.random() > 0.3) { // Only 70% of days have activity
        const numRequests = randomInt(2, 5);
        for (let i = 0; i < numRequests; i++) {
          requests.push({
            model: randomChoice(['gpt-3.5-turbo', 'gpt-4o-mini']),
            inputTokens: randomInt(100, 800),
            outputTokens: randomInt(50, 500),
            latencyMs: randomInt(300, 1500),
            status: 'success',
            daysAgo: day,
          });
        }
      }
    }
    return requests;
  },

  enterprise: (): RealisticRequest[] => {
    const requests: RealisticRequest[] = [];
    
    // Past 30 days, 200-400 requests per day with patterns
    for (let day = 0; day < 30; day++) {
      // Peak hours: 9AM-5PM
      for (let hour = 9; hour <= 17; hour++) {
        const numRequests = randomInt(20, 40);
        for (let i = 0; i < numRequests; i++) {
          requests.push({
            model: randomChoice([
              'gpt-4o',
              'gpt-4o',
              'gpt-4-turbo',
              'claude-3-5-sonnet-20241022',
              'claude-3-opus-20240229',
            ]),
            inputTokens: randomInt(800, 4000),
            outputTokens: randomInt(500, 3000),
            latencyMs: randomInt(600, 3500),
            status: Math.random() > 0.015 ? 'success' : 'error',
            daysAgo: day,
            hourOfDay: hour,
          });
        }
      }
      
      // Off-peak hours: some activity
      const offPeakRequests = randomInt(10, 30);
      for (let i = 0; i < offPeakRequests; i++) {
        requests.push({
          model: randomChoice(['gpt-4o-mini', 'gpt-3.5-turbo']),
          inputTokens: randomInt(200, 1000),
          outputTokens: randomInt(100, 800),
          latencyMs: randomInt(400, 2000),
          status: 'success',
          daysAgo: day,
        });
      }
    }
    return requests;
  },

  trial: (): RealisticRequest[] => {
    const requests: RealisticRequest[] = [];
    
    // Only past 7 days, testing phase
    for (let day = 0; day < 7; day++) {
      if (Math.random() > 0.4) {
        const numRequests = randomInt(1, 8);
        for (let i = 0; i < numRequests; i++) {
          requests.push({
            model: randomChoice(['gpt-3.5-turbo', 'gpt-4o-mini']),
            inputTokens: randomInt(50, 500),
            outputTokens: randomInt(30, 300),
            latencyMs: randomInt(300, 1200),
            status: 'success',
            daysAgo: day,
          });
        }
      }
    }
    return requests;
  },
};

async function seed() {
  console.log('🌱 Seeding realistic users with usage history...\n');

  try {
    // Get all providers first
    const allProviders = await db.select().from(providers);
    
    if (allProviders.length === 0) {
      console.error('❌ No providers found! Please run the main seed script first.');
      process.exit(1);
    }

    const providerMap = new Map(allProviders.map(p => [p.name, p]));

    // Organization and user configurations
    const orgConfigs = [
      {
        name: 'TechCorp AI Division',
        slug: 'techcorp-ai',
        description: 'Large tech company using AI for product features',
        plan: 'enterprise' as const,
        initialCredits: 100000, // $1,000
        usagePattern: 'enterprise' as const,
        users: [
          { name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.ai', role: 'owner' as const },
          { name: 'Mike Chen', email: 'mike.chen@techcorp.ai', role: 'admin' as const },
          { name: 'Emily Davis', email: 'emily.davis@techcorp.ai', role: 'user' as const },
        ],
        apiKeys: [
          'Production API',
          'Development API',
          'Testing API',
          'Mobile App Backend',
        ],
      },
      {
        name: 'StartupAI Labs',
        slug: 'startupalabs',
        description: 'AI-focused startup building next-gen chatbots',
        plan: 'pro' as const,
        initialCredits: 50000, // $500
        usagePattern: 'heavy' as const,
        users: [
          { name: 'Alex Rivera', email: 'alex@startupalabs.io', role: 'owner' as const },
          { name: 'Jessica Wu', email: 'jessica@startupalabs.io', role: 'admin' as const },
        ],
        apiKeys: [
          'Main Production Key',
          'Staging Environment',
          'Local Development',
        ],
      },
      {
        name: 'DataInsights Co',
        slug: 'datainsights',
        description: 'Data analytics company exploring AI capabilities',
        plan: 'pro' as const,
        initialCredits: 30000, // $300
        usagePattern: 'medium' as const,
        users: [
          { name: 'David Park', email: 'david@datainsights.com', role: 'owner' as const },
        ],
        apiKeys: [
          'Analytics Dashboard',
          'Report Generator',
        ],
      },
      {
        name: 'Freelance Solutions',
        slug: 'freelance-solutions',
        description: 'Independent developer building AI tools',
        plan: 'free' as const,
        initialCredits: 10000, // $100
        usagePattern: 'light' as const,
        users: [
          { name: 'Jordan Taylor', email: 'jordan@freelance.dev', role: 'owner' as const },
        ],
        apiKeys: [
          'Personal Projects',
        ],
      },
      {
        name: 'TrialCorp Evaluation',
        slug: 'trialcorp',
        description: 'Currently evaluating AIRouter for potential adoption',
        plan: 'free' as const,
        initialCredits: 5000, // $50
        usagePattern: 'trial' as const,
        users: [
          { name: 'Morgan Lee', email: 'morgan.lee@trialcorp.com', role: 'owner' as const },
        ],
        apiKeys: [
          'Evaluation Key',
        ],
      },
    ];

    const password = 'demo123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Create organizations, users, and usage
    for (const orgConfig of orgConfigs) {
      console.log(`\n📦 Creating organization: ${orgConfig.name}`);

      // Create organization
      const [org] = await db
        .insert(orgs)
        .values({
          name: orgConfig.name,
          slug: orgConfig.slug,
          description: orgConfig.description,
          plan: orgConfig.plan,
          creditBalance: orgConfig.initialCredits.toString(),
        })
        .returning();

      console.log(`   ✅ Created org with ${orgConfig.initialCredits} credits`);

      // Create users
      const createdUsers: typeof users.$inferSelect[] = [];
      for (const userConfig of orgConfig.users) {
        const [user] = await db
          .insert(users)
          .values({
            email: userConfig.email,
            passwordHash,
            name: userConfig.name,
            emailVerified: true,
            orgId: org.id,
            role: userConfig.role,
          })
          .returning();

        createdUsers.push(user);
        console.log(`   👤 Created user: ${userConfig.email}`);
      }

      // Create API keys
      const createdApiKeys: typeof apiKeys.$inferSelect[] = [];
      for (const keyName of orgConfig.apiKeys) {
        const apiKeyValue = `${process.env.API_KEY_PREFIX || 'sk-air'}-${nanoid(32)}`;
        const keyHash = await bcrypt.hash(apiKeyValue, 10);

        const [apiKey] = await db
          .insert(apiKeys)
          .values({
            key: apiKeyValue,
            keyHash,
            name: keyName,
            userId: createdUsers[randomInt(0, createdUsers.length - 1)].id, // Random user from org
            orgId: org.id,
            isActive: true,
            permissions: ['read', 'write'],
          })
          .returning();

        createdApiKeys.push(apiKey);
        console.log(`   🔑 Created API key: ${keyName}`);
        console.log(`      Key: ${apiKeyValue}`);
      }

      // Generate usage based on pattern
      console.log(`   📊 Generating ${orgConfig.usagePattern} usage pattern...`);
      const requestsToCreate = usagePatterns[orgConfig.usagePattern]();
      
      let totalCost = 0;
      let successCount = 0;
      let errorCount = 0;

      // Create requests in batches
      const batchSize = 100;
      for (let i = 0; i < requestsToCreate.length; i += batchSize) {
        const batch = requestsToCreate.slice(i, i + batchSize);
        
        const requestValues = batch.map(req => {
          // Determine provider based on model
          let providerName = 'openai';
          if (req.model.startsWith('claude')) providerName = 'anthropic';
          else if (req.model.startsWith('mistral')) providerName = 'mistral';
          else if (req.model.startsWith('gemini')) providerName = 'gemini';

          const provider = providerMap.get(providerName);
          if (!provider) {
            console.error(`❌ Provider not found: ${providerName}`);
            return null;
          }

          const cost = calculateCost(
            req.inputTokens,
            req.outputTokens,
            provider.pricing?.inputTokenPrice || 0,
            provider.pricing?.outputTokenPrice || 0
          );

          totalCost += cost;
          if (req.status === 'success') successCount++;
          else errorCount++;

          return {
            apiKeyId: randomChoice(createdApiKeys).id,
            orgId: org.id,
            providerId: provider.id,
            model: req.model,
            method: 'chat.completions',
            status: req.status,
            statusCode: req.status === 'success' ? 200 : req.status === 'error' ? 500 : 408,
            inputTokens: req.inputTokens,
            outputTokens: req.outputTokens,
            totalTokens: req.inputTokens + req.outputTokens,
            latencyMs: req.latencyMs,
            cost: cost.toString(),
            errorMessage: req.errorMessage,
            requestPayload: {
              model: req.model,
              messages: [{ role: 'user', content: 'Sample request' }],
            },
            responsePayload: req.status === 'success' ? {
              choices: [{ message: { role: 'assistant', content: 'Sample response' } }],
            } : null,
            metadata: {
              fallbackUsed: false,
            },
            createdAt: daysAgo(req.daysAgo, req.hourOfDay),
          };
        }).filter((v): v is NonNullable<typeof v> => v !== null);

        if (requestValues.length > 0) {
          await db.insert(requests).values(requestValues);
        }
      }

      console.log(`   ✅ Created ${requestsToCreate.length} requests`);
      console.log(`      Success: ${successCount}, Errors: ${errorCount}`);
      console.log(`      Total cost: $${(totalCost / 100).toFixed(2)}`);

      // Create billing events for the usage
      const currentBalance = parseFloat(org.creditBalance);
      const newBalance = currentBalance - totalCost;

      await db
        .insert(billingEvents)
        .values({
          orgId: org.id,
          type: 'usage_charge',
          amount: (-totalCost).toString(),
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          description: `Usage charges for ${requestsToCreate.length} API requests`,
          metadata: {},
          createdAt: new Date(),
        });

      // Update org balance
      await db
        .update(orgs)
        .set({ creditBalance: newBalance.toString() })
        .where(eq(orgs.id, org.id));

      console.log(`   💰 Updated balance: $${(currentBalance / 100).toFixed(2)} → $${(newBalance / 100).toFixed(2)}`);
    }

    console.log('\n\n🎉 Seeding completed successfully!\n');
    console.log('📝 All users use password: demo123\n');
    console.log('📧 User emails:');
    orgConfigs.forEach(org => {
      org.users.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error(error);
    process.exit(1);
  }
}

seed();

