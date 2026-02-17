import { pgTable, uuid, varchar, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orgs } from './orgs';

export const routingPolicies = pgTable('routing_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => orgs.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0).notNull(),
  strategy: varchar('strategy', { length: 50 }).notNull(), // cost, latency, fallback, round-robin
  rules: jsonb('rules').$type<{
    modelPatterns?: string[]; // ['gpt-4*', 'claude-3*']
    providers?: string[]; // ['openai', 'anthropic']
    maxCost?: number;
    maxLatency?: number;
    fallbackChain?: string[];
  }>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const routingPoliciesRelations = relations(routingPolicies, ({ one }) => ({
  org: one(orgs, {
    fields: [routingPolicies.orgId],
    references: [orgs.id],
  }),
}));

export type RoutingPolicy = typeof routingPolicies.$inferSelect;
export type NewRoutingPolicy = typeof routingPolicies.$inferInsert;

