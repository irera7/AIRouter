import { pgTable, uuid, varchar, timestamp, integer, text, jsonb, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orgs } from './orgs';

export const billingEvents = pgTable('billing_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => orgs.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // credit_purchase, usage_charge, refund
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(), // in cents with 2 decimal precision
  balanceBefore: numeric('balance_before', { precision: 12, scale: 2 }).notNull(), // in cents with 2 decimal precision
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(), // in cents with 2 decimal precision
  description: text('description'),
  metadata: jsonb('metadata').$type<{
    requestId?: string;
    paymentMethod?: string;
    invoiceId?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
  org: one(orgs, {
    fields: [billingEvents.orgId],
    references: [orgs.id],
  }),
}));

export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;

