/**
 * Add Mistral provider to existing database
 * Run this script to add Mistral AI provider if you already have a seeded database
 */

import { db } from './index.js';
import { providers } from './schema/index.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function addMistralProvider() {
  console.log('🔧 Adding Mistral provider to database...');

  try {
    // Check if Mistral already exists
    const existing = await db
      .select()
      .from(providers)
      .where(eq(providers.name, 'mistral'));

    if (existing.length > 0) {
      console.log('⚠️  Mistral provider already exists!');
      console.log('   Updating instead...');
      
      await db
        .update(providers)
        .set({
          displayName: 'Mistral AI',
          description: 'Mistral AI models',
          baseUrl: 'https://api.mistral.ai/v1',
          isActive: true,
          priority: 8,
          config: {
            apiKeyRequired: true,
            supportedModels: ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large', 'mixtral-8x7b', 'mixtral-8x22b'],
            timeout: 60000,
          },
          pricing: {
            inputTokenPrice: 6,
            outputTokenPrice: 18,
            currency: 'USD',
          },
        })
        .where(eq(providers.name, 'mistral'));
      
      console.log('✅ Updated Mistral provider');
    } else {
      // Insert new Mistral provider
      const [mistralProvider] = await db
        .insert(providers)
        .values({
          name: 'mistral',
          displayName: 'Mistral AI',
          description: 'Mistral AI models',
          baseUrl: 'https://api.mistral.ai/v1',
          isActive: true,
          priority: 8,
          config: {
            apiKeyRequired: true,
            supportedModels: ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large', 'mixtral-8x7b', 'mixtral-8x22b'],
            timeout: 60000,
          },
          pricing: {
            inputTokenPrice: 6,
            outputTokenPrice: 18,
            currency: 'USD',
          },
        })
        .returning();

      console.log('✅ Added Mistral provider:', mistralProvider.name);
    }

    console.log('\n✨ Done! Restart the backend to initialize the Mistral provider.');
    console.log('   Make sure MISTRAL_API_KEY is set in your .env file.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add Mistral provider:', error);
    process.exit(1);
  }
}

addMistralProvider();

