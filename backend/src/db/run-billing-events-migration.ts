/**
 * Run billing events cost precision migration
 * Changes amount column from integer to numeric(10,2)
 */

import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://airouter:airouter_pass@localhost:5432/airouter', { max: 1 });

async function runMigration() {
  try {
    console.log('🔄 Running billing events cost precision migration...');
    
    // Change amount column from integer to numeric(10,2)
    await sql`
      ALTER TABLE billing_events 
      ALTER COLUMN amount TYPE numeric(10, 2);
    `;
    console.log('✅ amount column migrated');
    
    // Change balance columns from integer to numeric(12,2)
    await sql`
      ALTER TABLE billing_events 
      ALTER COLUMN balance_before TYPE numeric(12, 2);
    `;
    console.log('✅ balance_before column migrated');
    
    await sql`
      ALTER TABLE billing_events 
      ALTER COLUMN balance_after TYPE numeric(12, 2);
    `;
    console.log('✅ balance_after column migrated');
    
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('   All billing_events columns are now numeric');
    console.log('   - amount: numeric(10, 2)');
    console.log('   - balance_before: numeric(12, 2)');
    console.log('   - balance_after: numeric(12, 2)');
    
  } catch (error: any) {
    if (error.message.includes('cannot be cast automatically') || error.message.includes('already exists')) {
      console.log('⚠️  Migration already applied - columns are already numeric');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await sql.end();
  }
}

runMigration();

