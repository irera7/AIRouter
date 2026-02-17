import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './backend/src/db/schema/index.ts',
  out: './backend/src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://airouter:airouter_pass@localhost:5432/airouter',
  },
  verbose: true,
  strict: true,
} satisfies Config;

