import { db } from './index.js';
import { users, orgs, apiKeys, providers } from './schema/index.js';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create demo organization
    const [demoOrg] = await db
      .insert(orgs)
      .values({
        name: 'Demo Organization',
        slug: 'demo-org',
        description: 'Demo organization for testing',
        plan: 'pro',
        creditBalance: '100000', // $1000 in credits (stored as string for numeric type)
      })
      .returning();

    console.log('✅ Created demo organization:', demoOrg.name);

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 10);
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@airouter.dev',
        passwordHash,
        name: 'Demo User',
        emailVerified: true,
        orgId: demoOrg.id,
        role: 'owner',
      })
      .returning();

    console.log('✅ Created demo user:', demoUser.email);

    // Create demo API key
    const apiKeyValue = `${process.env.API_KEY_PREFIX || 'sk-air'}-${nanoid(32)}`;
    const keyHash = await bcrypt.hash(apiKeyValue, 10);

    const [demoApiKey] = await db
      .insert(apiKeys)
      .values({
        key: apiKeyValue,
        keyHash,
        name: 'Demo API Key',
        userId: demoUser.id,
        orgId: demoOrg.id,
        isActive: true,
        permissions: ['read', 'write'],
      })
      .returning();

    console.log('✅ Created demo API key:', apiKeyValue);
    console.log('   Save this key! It won\'t be shown again.');

    // Seed providers
    const providerData = [
      {
        name: 'openai',
        displayName: 'OpenAI',
        description: 'OpenAI GPT models',
        baseUrl: 'https://api.openai.com/v1',
        isActive: true,
        priority: 10,
        config: {
          apiKeyRequired: true,
          supportedModels: [
            // GPT-4o Series (Latest)
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4o-2024-11-20',
            'gpt-4o-2024-08-06',
            'gpt-4o-2024-05-13',
            'gpt-4o-mini-2024-07-18',
            // o1 Series (Reasoning models)
            'o1-preview',
            'o1-preview-2024-09-12',
            'o1-mini',
            'o1-mini-2024-09-12',
            // o3 Series
            'o3-mini',
            'o3-mini-2025-01-31',
            // GPT-5 Series
            'gpt-5',
            'gpt-5-mini',
            // GPT-4 Turbo
            'gpt-4-turbo',
            'gpt-4-turbo-2024-04-09',
            'gpt-4-turbo-preview',
            'gpt-4-0125-preview',
            'gpt-4-1106-preview',
            // GPT-4
            'gpt-4',
            'gpt-4-0613',
            // GPT-3.5 Turbo
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0125',
            'gpt-3.5-turbo-1106',
          ],
          timeout: 60000,
        },
        pricing: {
          inputTokenPrice: 30, // $30 per 1M tokens
          outputTokenPrice: 60,
          currency: 'USD',
        },
      },
      {
        name: 'anthropic',
        displayName: 'Anthropic',
        description: 'Claude models by Anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        isActive: true,
        priority: 9,
        config: {
          apiKeyRequired: true,
          supportedModels: [
            // Claude 3.5 Series
            'claude-3-5-sonnet-20241022',
            'claude-3-5-sonnet-20240620',
            'claude-3-5-haiku-20241022',
            // Claude 3 Series
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            // Claude 2 Series
            'claude-2.1',
            'claude-2.0',
            'claude-instant-1.2',
          ],
          timeout: 60000,
        },
        pricing: {
          inputTokenPrice: 15,
          outputTokenPrice: 75,
          currency: 'USD',
        },
      },
      {
        name: 'mistral',
        displayName: 'Mistral AI',
        description: 'Mistral AI models',
        baseUrl: 'https://api.mistral.ai/v1',
        isActive: true,
        priority: 8,
        config: {
          apiKeyRequired: true,
          supportedModels: [
            // Mistral Large
            'mistral-large-latest',
            'mistral-large-2411',
            'mistral-large-2407',
            // Mistral Medium
            'mistral-medium-latest',
            'mistral-medium-2312',
            // Mistral Small
            'mistral-small-latest',
            'mistral-small-2409',
            'mistral-small-2402',
            // Other models
            'mistral-tiny',
            'mixtral-8x7b-instruct',
            'mixtral-8x22b-instruct',
            // Codestral
            'codestral-latest',
            'codestral-2405',
            // Embeddings
            'mistral-embed',
          ],
          timeout: 60000,
        },
        pricing: {
          inputTokenPrice: 6, // $6 per 1M tokens (mistral-small)
          outputTokenPrice: 18,
          currency: 'USD',
        },
      },
      {
        name: 'gemini',
        displayName: 'Google Gemini',
        description: 'Google Gemini models',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        isActive: true,
        priority: 7,
        config: {
          apiKeyRequired: true,
          supportedModels: [
            'gemini-2.0-flash-exp',
            'gemini-2.0-flash-thinking-exp-1219',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.0-pro',
            'gemini-1.0-pro-vision'
          ],
          timeout: 60000,
        },
        pricing: {
          inputTokenPrice: 1.25, // $1.25 per 1M tokens (gemini-1.5-flash average)
          outputTokenPrice: 5,
          currency: 'USD',
        },
      },
      {
        name: 'mock',
        displayName: 'Mock Provider',
        description: 'Mock provider for testing',
        baseUrl: 'http://localhost:3001',
        isActive: true,
        priority: 1,
        config: {
          apiKeyRequired: false,
          supportedModels: ['mock-gpt-4', 'mock-claude-3'],
          timeout: 5000,
        },
        pricing: {
          inputTokenPrice: 0,
          outputTokenPrice: 0,
          currency: 'USD',
        },
      },
    ];

    const insertedProviders = await db.insert(providers).values(providerData).returning();

    console.log('✅ Created providers:', insertedProviders.map(p => p.name).join(', '));

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Demo credentials:');
    console.log('   Email: demo@airouter.dev');
    console.log('   Password: demo123');
    console.log(`   API Key: ${apiKeyValue}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

