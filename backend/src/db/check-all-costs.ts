/**
 * Check all tables for cost columns
 */

import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://airouter:airouter_pass@localhost:5432/airouter', { max: 1 });

async function checkAllCostColumns() {
  try {
    console.log('🔍 Searching for all "cost" columns...\n');
    
    const columns = await sql`
      SELECT 
        table_name,
        column_name, 
        data_type, 
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE column_name = 'cost'
      AND table_schema = 'public'
      ORDER BY table_name;
    `;
    
    if (columns.length === 0) {
      console.log('❌ No cost columns found!');
    } else {
      console.log(`📊 Found ${columns.length} cost column(s):\n`);
      
      for (const col of columns) {
        const status = col.data_type === 'numeric' ? '✅' : '❌';
        console.log(`${status} Table: ${col.table_name}`);
        console.log(`   Column: ${col.column_name}`);
        console.log(`   Type: ${col.data_type}`);
        if (col.data_type === 'numeric') {
          console.log(`   Precision: ${col.numeric_precision}, Scale: ${col.numeric_scale}`);
        }
        console.log('');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkAllCostColumns();

