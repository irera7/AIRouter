import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orgs } from './orgs';
import { apiKeys } from './apiKeys';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  orgId: uuid('org_id').references(() => orgs.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('user').notNull(), // user, admin, owner
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  org: one(orgs, {
    fields: [users.orgId],
    references: [orgs.id],
  }),
  apiKeys: many(apiKeys),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

