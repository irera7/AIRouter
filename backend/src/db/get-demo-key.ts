import { db } from './index.js';
import { apiKeys } from './schema/index.js';
import { eq } from 'drizzle-orm';

async function getDemoKey() {
  try {
    const keys = await db.select().from(apiKeys).where(eq(apiKeys.isActive, true)).limit(1);
    if (keys.length > 0) {
      console.log(keys[0].key);
    } else {
      console.error('No active API keys found');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

getDemoKey();

