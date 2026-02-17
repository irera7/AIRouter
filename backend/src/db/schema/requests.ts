import { pgTable, uuid, varchar, timestamp, integer, text, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { apiKeys } from './apiKeys';
import { providers } from './providers';
import { orgs } from './orgs';

export const requests = pgTable('requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
  orgId: uuid('org_id').references(() => orgs.id, { onDelete: 'cascade' }).notNull(),
  providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'set null' }),
  model: varchar('model', { length: 255 }).notNull(),
  method: varchar('method', { length: 50 }).notNull(), // chat.completions, embeddings, etc.
  status: varchar('status', { length: 50 }).notNull(), // success, error, timeout
  statusCode: integer('status_code'),
  inputTokens: integer('input_tokens').default(0).notNull(),
  outputTokens: integer('output_tokens').default(0).notNull(),
  totalTokens: integer('total_tokens').default(0).notNull(),
  latencyMs: integer('latency_ms').notNull(),
  cost: numeric('cost', { precision: 10, scale: 2 }).default('0').notNull(), // in cents with 2 decimal precision
  requestPayload: jsonb('request_payload').$type<Record<string, any>>(),
  responsePayload: jsonb('response_payload').$type<Record<string, any>>(),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').$type<{
    userAgent?: string;
    ip?: string;
    region?: string;
    fallbackUsed?: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const requestsRelations = relations(requests, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [requests.apiKeyId],
    references: [apiKeys.id],
  }),
  provider: one(providers, {
    fields: [requests.providerId],
    references: [providers.id],
  }),
  org: one(orgs, {
    fields: [requests.orgId],
    references: [orgs.id],
  }),
}));

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;

