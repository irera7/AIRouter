import { db } from '../backend/src/db/index.js';
import { users } from '../backend/src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    const userId = 'd8b86ba0-4398-4f6f-ab06-d6f514ea35f5';
    
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        orgId: users.orgId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastLogin: users.lastLoginAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    console.log('User:', user[0]);
    console.log('Role:', user[0]?.role);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

test();
