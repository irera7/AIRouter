import { pgTable, uuid, varchar, timestamp, text, integer, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { apiKeys } from './apiKeys';
import { billingEvents } from './billingEvents';
import { routingPolicies } from './routingPolicies';

export const orgs = pgTable('orgs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  plan: varchar('plan', { length: 50 }).default('free').notNull(), // free, pro, enterprise
  creditBalance: numeric('credit_balance', { precision: 12, scale: 2 }).default('0').notNull(), // in cents with 2 decimal precision
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orgsRelations = relations(orgs, ({ many }) => ({
  users: many(users),
  apiKeys: many(apiKeys),
  billingEvents: many(billingEvents),
  routingPolicies: many(routingPolicies),
}));

export type Org = typeof orgs.$inferSelect;
export type NewOrg = typeof orgs.$inferInsert;

