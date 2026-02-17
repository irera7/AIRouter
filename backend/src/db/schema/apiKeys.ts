import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { orgs } from './orgs';
import { requests } from './requests';

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(), // sk-air-xxxxx
  keyHash: text('key_hash').notNull(), // bcrypt hash for security
  name: varchar('name', { length: 255 }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  orgId: uuid('org_id').references(() => orgs.id, { onDelete: 'cascade' }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(), // ['read', 'write', 'admin']
  rateLimit: jsonb('rate_limit').$type<{ maxRequests: number; windowMs: number }>(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [apiKeys.orgId],
    references: [orgs.id],
  }),
  requests: many(requests),
}));

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

