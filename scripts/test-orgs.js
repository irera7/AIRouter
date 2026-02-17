import { db } from '../backend/src/db/index.js';
import { orgs } from '../backend/src/db/schema/index.js';

async function test() {
  console.log('Orgs schema keys:', Object.keys(orgs));
  console.log('orgs.isActive:', orgs.isActive);
  
  const allOrgs = await db.select().from(orgs).limit(1);
  console.log('Org:', allOrgs[0]);
  
  process.exit(0);
}

test();
