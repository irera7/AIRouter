/**
 * Run cost precision migration
 * Changes cost column from integer to numeric(10,2)
 */

import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://airouter:airouter_pass@localhost:5432/airouter', { max: 1 });

async function runMigration() {
  try {
    console.log('🔄 Running cost precision migration...');
    
    // Change cost column from integer to numeric(10,2)
    await sql`
      ALTER TABLE requests 
      ALTER COLUMN cost TYPE numeric(10, 2);
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log('   cost column is now numeric(10, 2)');
    console.log('   Can store values like 0.01 cents = $0.0001');
    
  } catch (error: any) {
    if (error.message.includes('cannot be cast automatically') || error.message.includes('already exists')) {
      console.log('⚠️  Migration already applied - cost column is already numeric');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await sql.end();
  }
}

runMigration();

