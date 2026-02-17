import { db } from '../backend/src/db/index.js';
import { users } from '../backend/src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    console.log('Users schema keys:', Object.keys(users));
    console.log('users.id:', users.id);
    console.log('users.email:', users.email);
    console.log('users.isActive:', users.isActive);
    
    // Try simple select
    const result = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .limit(1);
    
    console.log('Simple select works!', result[0]);
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
