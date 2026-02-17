/**
 * Test Drizzle numeric insert
 */

import { db } from '../backend/src/db/index.js';
import { requests } from '../backend/src/db/schema/index.js';
import { config } from 'dotenv';

config();

async function testDrizzleInsert() {
  try {
    console.log('🔍 Testing Drizzle numeric insert...\n');
    
    // Test inserting a negative decimal value
    const testData = {
      apiKeyId: '00000000-0000-0000-0000-000000000001',
      orgId: '00000000-0000-0000-0000-000000000001',
      providerId: '00000000-0000-0000-0000-000000000001',
      model: 'test-model',
      method: 'test',
      status: 'success',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      latencyMs: 500,
      cost: -0.16,  // This is the problematic value
    };
    
    console.log('Attempting to insert:', JSON.stringify(testData, null, 2));
    console.log('Cost value:', testData.cost);
    console.log('Cost type:', typeof testData.cost);
    console.log('');
    
    const result = await db.insert(requests).values(testData).returning();
    
    console.log('✅ Insert succeeded!');
    console.log('Returned cost:', result[0].cost);
    console.log('Returned cost type:', typeof result[0].cost);
    
    // Clean up
    await db.delete(requests).where(eq(requests.id, result[0].id));
    console.log('✅ Test cleanup completed');
    
  } catch (error: any) {
    console.error('❌ Insert failed!');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

testDrizzleInsert();

import { eq } from 'drizzle-orm';

