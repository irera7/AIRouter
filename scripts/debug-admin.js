import { db } from '../backend/src/db/index.js';
import { users } from '../backend/src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    // Test getting user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, 'demo@airouter.dev'))
      .limit(1);
    
    console.log('User found:', user[0]);
    console.log('Role:', user[0]?.role);
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
