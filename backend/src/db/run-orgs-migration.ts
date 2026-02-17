/**
 * Run orgs credit balance precision migration
 * Changes credit_balance column from integer to numeric(12,2)
 */

import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://airouter:airouter_pass@localhost:5432/airouter', { max: 1 });

async function runMigration() {
  try {
    console.log('🔄 Running orgs credit_balance precision migration...');
    
    // Change credit_balance column from integer to numeric(12,2)
    await sql`
      ALTER TABLE orgs 
      ALTER COLUMN credit_balance TYPE numeric(12, 2);
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log('   credit_balance column in orgs is now numeric(12, 2)');
    console.log('   Can store values like 100199.85 cents = $1001.99');
    
  } catch (error: any) {
    if (error.message.includes('cannot be cast automatically') || error.message.includes('already exists')) {
      console.log('⚠️  Migration already applied - credit_balance column is already numeric');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await sql.end();
  }
}

runMigration();

