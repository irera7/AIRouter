/**
 * Request Logger Service
 * Logs all API requests to database for analytics and billing
 */

import { db } from '../db/index';
import { requests, billingEvents, orgs } from '../db/schema';
import { logger } from './logger';
// Import types (commented out if unused)
// import { ChatCompletionRequest, ChatCompletionResponse } from '../modules/providers/types';

export interface RequestLogData {
  apiKeyId: string;
  orgId: string;
  providerId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number; // in cents
  status: 'success' | 'error';
  errorMessage?: string;
  cached?: boolean;
  request?: any;
  response?: any;
}

export class RequestLoggerService {
  /**
   * Log a completed request
   */
  async logRequest(data: RequestLogData): Promise<string> {
    try {
      // Debug: Log the cost value and its type
      logger.info({
        cost: data.cost,
        costType: typeof data.cost,
        costValue: JSON.stringify(data.cost),
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        providerId: data.providerId,
        model: data.model,
      }, '🔍 About to insert request into database');

      const [request] = await db.insert(requests).values({
        apiKeyId: data.apiKeyId,
        orgId: data.orgId,
        providerId: data.providerId,
        model: data.model,
        method: 'chat.completions',
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        latencyMs: data.latencyMs,
        cost: String(data.cost), // Convert to string for numeric DB type
        status: data.status,
        errorMessage: data.errorMessage,
        requestPayload: data.request,
        responsePayload: data.response,
        metadata: {
          fallbackUsed: false,
        },
      }).returning({ id: requests.id });

      logger.info({
        requestId: request.id,
        apiKeyId: data.apiKeyId,
        model: data.model,
        cost: data.cost,
        latency: data.latencyMs,
        cached: data.cached,
      }, 'Request logged');

      return request.id;
    } catch (error) {
      logger.error({ 
        error, 
        data,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      }, '❌ Failed to log request - DATABASE INSERT ERROR');
      throw error;
    }
  }

  /**
   * Create a billing event for a request
   */
  async createBillingEvent(
    orgId: string,
    requestId: string,
    amount: number,
    description: string
  ): Promise<string> {
    try {
      // Get current balance
      const [org] = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, orgId))
        .limit(1);

      if (!org) {
        throw new Error('Organization not found');
      }

      const balanceBefore = parseFloat(String(org.creditBalance)) || 0;
      const balanceAfter = balanceBefore - amount;

      const [event] = await db.insert(billingEvents).values({
        orgId,
        type: 'usage',
        amount: String(-amount), // Negative for debit
        balanceBefore: String(balanceBefore),
        balanceAfter: String(balanceAfter),
        description,
        metadata: { requestId },
      }).returning({ id: billingEvents.id });

      logger.info({
        eventId: event.id,
        orgId,
        amount,
      }, 'Billing event created');

      return event.id;
    } catch (error) {
      logger.error({ error }, 'Failed to create billing event');
      throw error;
    }
  }

  /**
   * Get request statistics for an organization
   */
  async getOrgStatistics(
    orgId: string,
    _startDate?: Date,
    _endDate?: Date
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCost: number;
    totalTokens: number;
    averageLatency: number;
    byProvider: Record<string, any>;
    byModel: Record<string, any>;
  }> {
    try {
      // This is a simplified version - in production you'd want more optimized queries
      const allRequests = await db
        .select()
        .from(requests)
        .where(eq(requests.orgId, orgId));

      const stats = {
        totalRequests: allRequests.length,
        successfulRequests: allRequests.filter(r => r.status === 'success').length,
        failedRequests: allRequests.filter(r => r.status === 'error').length,
        totalCost: allRequests.reduce((sum, r) => sum + (parseFloat(String(r.cost)) || 0), 0),
        totalTokens: allRequests.reduce((sum, r) => sum + (r.totalTokens || 0), 0),
        averageLatency: allRequests.reduce((sum, r) => sum + (r.latencyMs || 0), 0) / allRequests.length,
        byProvider: {} as Record<string, any>,
        byModel: {} as Record<string, any>,
      };

      // Group by provider
      for (const request of allRequests) {
        const providerId = request.providerId || 'unknown';
        if (!stats.byProvider[providerId]) {
          stats.byProvider[providerId] = {
            count: 0,
            cost: 0,
            tokens: 0,
          };
        }
        stats.byProvider[providerId].count++;
        stats.byProvider[providerId].cost += request.cost || 0;
        stats.byProvider[providerId].tokens += request.totalTokens || 0;
      }

      // Group by model
      for (const request of allRequests) {
        const model = request.model || 'unknown';
        if (!stats.byModel[model]) {
          stats.byModel[model] = {
            count: 0,
            cost: 0,
            tokens: 0,
          };
        }
        stats.byModel[model].count++;
        stats.byModel[model].cost += request.cost || 0;
        stats.byModel[model].tokens += request.totalTokens || 0;
      }

      return stats;
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get org statistics');
      throw error;
    }
  }

  /**
   * Get recent requests for an API key
   */
  async getRecentRequests(
    apiKeyId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      return await db
        .select()
        .from(requests)
        .where(eq(requests.apiKeyId, apiKeyId))
        .orderBy(desc(requests.createdAt))
        .limit(limit);
    } catch (error) {
      logger.error({ error, apiKeyId }, 'Failed to get recent requests');
      throw error;
    }
  }
}

// Singleton instance
export const requestLogger = new RequestLoggerService();

// Import eq and desc from drizzle-orm
import { eq, desc } from 'drizzle-orm';

