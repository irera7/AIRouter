/**
 * Billing Module Types
 */

export interface BillingEvent {
  id: string
  userId?: string  // Optional - not always needed
  orgId: string
  type: 'credit' | 'debit' | 'refund' | 'usage_charge' | string
  amount: number | string  // Stored as string in DB (numeric type)
  balanceBefore: number | string
  balanceAfter: number | string
  description: string | null
  metadata?: Record<string, any> | null
  createdAt: Date
}

export interface BillingBalance {
  orgId: string
  balance: number
  currency: string
  lastUpdated: Date
}

export interface AddCreditRequest {
  amount: number
  paymentMethod: string
  paymentDetails?: Record<string, any>
}

export interface BillingEventsQuery {
  startDate?: Date
  endDate?: Date
  type?: 'credit' | 'debit' | 'refund'
  limit?: number
  offset?: number
}

export interface BillingStats {
  currentBalance: number
  thisMonthSpent: number
  lastMonthSpent: number
  avgDailyCost: number
  totalCredits: number
  totalDebits: number
  totalRefunds: number
}

