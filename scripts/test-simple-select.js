import { db } from '../backend/src/db/index.js';
import { users } from '../backend/src/db/schema/index.js';

async function test() {
  try {
    // Simple select all
    const allUsers = await db.select().from(users).limit(1);
    console.log('Users found:', allUsers.length);
    console.log('User:', allUsers[0]);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

test();
