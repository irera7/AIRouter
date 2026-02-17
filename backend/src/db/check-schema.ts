/**
 * Check the current database schema for requests table
 */

import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://airouter:airouter_pass@localhost:5432/airouter', { max: 1 });

async function checkSchema() {
  try {
    console.log('🔍 Checking requests table schema...\n');
    
    // Get column information
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'requests' 
      AND column_name = 'cost';
    `;
    
    if (columns.length === 0) {
      console.log('❌ Cost column not found!');
    } else {
      const col = columns[0];
      console.log('📊 Cost Column Info:');
      console.log('   Column Name:', col.column_name);
      console.log('   Data Type:', col.data_type);
      console.log('   Precision:', col.numeric_precision);
      console.log('   Scale:', col.numeric_scale);
      console.log('   Nullable:', col.is_nullable);
      console.log('   Default:', col.column_default);
      console.log('');
      
      if (col.data_type === 'numeric') {
        console.log('✅ Column type is correct (numeric)');
      } else {
        console.log('❌ Column type is WRONG:', col.data_type);
        console.log('   Expected: numeric');
        console.log('   You may need to restart the database connection');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkSchema();

