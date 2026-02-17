/**
 * Billing Service
 * Handles billing operations, balance management, and transaction history
 */

import { db } from '../../db/index.js'
import { billingEvents, orgs } from '../../db/schema/index.js'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { 
  BillingEvent, 
  BillingBalance, 
  AddCreditRequest, 
  BillingEventsQuery,
  BillingStats 
} from './types.js'

export class BillingService {
  /**
   * Get current balance for an organization
   */
  async getBalance(orgId: string): Promise<BillingBalance> {
    const [org] = await db
      .select({
        balance: orgs.creditBalance,
      })
      .from(orgs)
      .where(eq(orgs.id, orgId))
      .limit(1)

    if (!org) {
      throw new Error('Organization not found')
    }

    return {
      orgId,
      balance: parseFloat(String(org.balance)) || 0,
      currency: 'USD',
      lastUpdated: new Date(),
    }
  }

  /**
   * Get billing events/transaction history
   */
  async getEvents(
    orgId: string,
    query: BillingEventsQuery = {}
  ): Promise<BillingEvent[]> {
    const conditions = [eq(billingEvents.orgId, orgId)]

    if (query.type) {
      conditions.push(eq(billingEvents.type, query.type))
    }

    if (query.startDate) {
      conditions.push(gte(billingEvents.createdAt, query.startDate))
    }

    if (query.endDate) {
      conditions.push(lte(billingEvents.createdAt, query.endDate))
    }

    const events = await db
      .select()
      .from(billingEvents)
      .where(and(...conditions))
      .orderBy(desc(billingEvents.createdAt))
      .limit(query.limit || 50)
      .offset(query.offset || 0)

    return events as BillingEvent[]
  }

  /**
   * Add credit to account
   */
  async addCredit(
    userId: string,
    orgId: string,
    request: AddCreditRequest
  ): Promise<BillingEvent> {
    const { amount, paymentMethod, paymentDetails } = request

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    // Get current balance
    const balance = await this.getBalance(orgId)

    // Create billing event
    const event = {
      id: uuidv4(),
      orgId,
      type: 'credit' as const,
      amount: String(amount),
      balanceBefore: String(balance.balance),
      balanceAfter: String(balance.balance + amount),
      description: `Credit added via ${paymentMethod}`,
      metadata: paymentDetails || {},
      createdAt: new Date(),
    }

    // Insert event and update balance in transaction
    await db.transaction(async (tx) => {
      await tx.insert(billingEvents).values(event as any)
      
      await tx
        .update(orgs)
        .set({ 
          creditBalance: sql`${orgs.creditBalance} + ${amount}`,
        })
        .where(eq(orgs.id, orgId))
    })

    return event
  }

  /**
   * Deduct credit from account (used when making API calls)
   */
  async deductCredit(
    userId: string,
    orgId: string,
    amount: number,
    description: string
  ): Promise<BillingEvent> {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    // Get current balance
    const balance = await this.getBalance(orgId)

    if (balance.balance < amount) {
      throw new Error('Insufficient balance')
    }

    // Create billing event
    const event = {
      id: uuidv4(),
      orgId,
      type: 'debit' as const,
      amount: String(amount),
      balanceBefore: String(balance.balance),
      balanceAfter: String(balance.balance - amount),
      description,
      metadata: {},
      createdAt: new Date(),
    }

    // Insert event and update balance in transaction
    await db.transaction(async (tx) => {
      await tx.insert(billingEvents).values(event as any)
      
      await tx
        .update(orgs)
        .set({ 
          creditBalance: sql`${orgs.creditBalance} - ${amount}`,
        })
        .where(eq(orgs.id, orgId))
    })

    return event
  }

  /**
   * Get billing statistics
   */
  async getStats(orgId: string): Promise<BillingStats> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get current balance
    const balance = await this.getBalance(orgId)

    // Get this month's spending
    const [thisMonth] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${billingEvents.amount}), 0)`,
      })
      .from(billingEvents)
      .where(
        and(
          eq(billingEvents.orgId, orgId),
          eq(billingEvents.type, 'debit'),
          gte(billingEvents.createdAt, startOfMonth)
        )
      )

    // Get last month's spending
    const [lastMonth] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${billingEvents.amount}), 0)`,
      })
      .from(billingEvents)
      .where(
        and(
          eq(billingEvents.orgId, orgId),
          eq(billingEvents.type, 'debit'),
          gte(billingEvents.createdAt, startOfLastMonth),
          lte(billingEvents.createdAt, endOfLastMonth)
        )
      )

    // Get last 7 days average
    const [last7Days] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${billingEvents.amount}), 0)`,
        days: sql<number>`7`,
      })
      .from(billingEvents)
      .where(
        and(
          eq(billingEvents.orgId, orgId),
          eq(billingEvents.type, 'debit'),
          gte(billingEvents.createdAt, sevenDaysAgo)
        )
      )

    // Get totals by type
    const [totals] = await db
      .select({
        credits: sql<number>`COALESCE(SUM(CASE WHEN ${billingEvents.type} = 'credit' THEN ${billingEvents.amount} ELSE 0 END), 0)`,
        debits: sql<number>`COALESCE(SUM(CASE WHEN ${billingEvents.type} = 'debit' THEN ${billingEvents.amount} ELSE 0 END), 0)`,
        refunds: sql<number>`COALESCE(SUM(CASE WHEN ${billingEvents.type} = 'refund' THEN ${billingEvents.amount} ELSE 0 END), 0)`,
      })
      .from(billingEvents)
      .where(eq(billingEvents.orgId, orgId))

    return {
      currentBalance: balance.balance,
      thisMonthSpent: thisMonth?.total || 0,
      lastMonthSpent: lastMonth?.total || 0,
      avgDailyCost: (last7Days?.total || 0) / 7,
      totalCredits: totals?.credits || 0,
      totalDebits: totals?.debits || 0,
      totalRefunds: totals?.refunds || 0,
    }
  }
}

