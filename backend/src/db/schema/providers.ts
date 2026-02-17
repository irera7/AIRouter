import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { requests } from './requests';

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(), // openai, anthropic, local
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  baseUrl: text('base_url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0).notNull(), // for routing preference
  config: jsonb('config').$type<{
    apiKeyRequired: boolean;
    supportedModels: string[];
    rateLimit?: { maxRequests: number; windowMs: number };
    timeout?: number;
  }>().notNull(),
  pricing: jsonb('pricing').$type<{
    inputTokenPrice: number; // per 1M tokens
    outputTokenPrice: number; // per 1M tokens
    currency: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const providersRelations = relations(providers, ({ many }) => ({
  requests: many(requests),
}));

export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;

