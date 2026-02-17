/**
 * Analytics Service
 * Provides advanced analytics and usage tracking capabilities
 */

import { db } from '../../db/index.js';
import { requests, billingEvents, users, orgs } from '../../db/schema/index.js';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import {
  TimeRange,
  UsageTrend,
  ProviderStats,
  ModelStats,
  CostBreakdown,
  UsageMetrics,
  TopUser,
  AnalyticsSummary,
} from './types.js';

export class AnalyticsService {
  /**
   * Get comprehensive analytics summary for an organization
   */
  async getAnalyticsSummary(
    orgId: string,
    timeRange: TimeRange
  ): Promise<AnalyticsSummary> {
    try {
      logger.info({ orgId, timeRange }, 'Fetching analytics summary');

      const [
        metrics,
        trends,
        providerStats,
        modelStats,
        costBreakdown,
        topUsers,
      ] = await Promise.all([
        this.getUsageMetrics(orgId, timeRange),
        this.getUsageTrends(orgId, timeRange),
        this.getProviderStats(orgId, timeRange),
        this.getModelStats(orgId, timeRange),
        this.getCostBreakdown(orgId, timeRange),
        this.getTopUsers(orgId, timeRange, 10),
      ]);

      return {
        timeRange,
        metrics,
        trends,
        providerStats,
        modelStats,
        costBreakdown,
        topUsers,
      };
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get analytics summary');
      throw error;
    }
  }

  /**
   * Get overall usage metrics
   */
  async getUsageMetrics(
    orgId: string,
    timeRange: TimeRange
  ): Promise<UsageMetrics> {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.orgId, orgId),
            gte(requests.createdAt, timeRange.startDate),
            lte(requests.createdAt, timeRange.endDate)
          )
        );

      const totalRequests = allRequests.length;
      const successfulRequests = allRequests.filter(
        (r) => r.status === 'success'
      ).length;
      const cachedRequests = allRequests.filter((r) => r.metadata?.fallbackUsed === false).length;

      const totalTokens = allRequests.reduce(
        (sum, r) => sum + (r.totalTokens || 0),
        0
      );
      const totalCost = allRequests.reduce(
        (sum, r) => sum + (parseFloat(String(r.cost)) || 0),
        0
      );
      const totalLatency = allRequests.reduce(
        (sum, r) => sum + (r.latencyMs || 0),
        0
      );

      return {
        totalRequests,
        totalTokens,
        totalCost,
        averageLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
        errorRate:
          totalRequests > 0
            ? ((totalRequests - successfulRequests) / totalRequests) * 100
            : 0,
        cacheHitRate:
          totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0,
      };
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get usage metrics');
      throw error;
    }
  }

  /**
   * Get usage trends over time (daily breakdown)
   */
  async getUsageTrends(
    orgId: string,
    timeRange: TimeRange,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Promise<UsageTrend[]> {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.orgId, orgId),
            gte(requests.createdAt, timeRange.startDate),
            lte(requests.createdAt, timeRange.endDate)
          )
        )
        .orderBy(requests.createdAt);

      // Group by date
      const trendMap = new Map<string, UsageTrend>();

      for (const request of allRequests) {
        const date = this.formatDateByGranularity(
          request.createdAt!,
          granularity
        );

        if (!trendMap.has(date)) {
          trendMap.set(date, {
            date,
            requests: 0,
            tokens: 0,
            cost: 0,
            errors: 0,
          });
        }

        const trend = trendMap.get(date)!;
        trend.requests++;
        trend.tokens += request.totalTokens || 0;
        trend.cost += parseFloat(String(request.cost)) || 0;
        if (request.status === 'error') {
          trend.errors++;
        }
      }

      return Array.from(trendMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get usage trends');
      throw error;
    }
  }

  /**
   * Get statistics by provider
   */
  async getProviderStats(
    orgId: string,
    timeRange: TimeRange
  ): Promise<ProviderStats[]> {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.orgId, orgId),
            gte(requests.createdAt, timeRange.startDate),
            lte(requests.createdAt, timeRange.endDate)
          )
        );

      const providerMap = new Map<string, ProviderStats>();

      for (const request of allRequests) {
        const providerId = request.providerId || 'unknown';

        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            providerId,
            providerName: providerId, // TODO: Get from providers table
            requests: 0,
            successRate: 0,
            averageLatency: 0,
            totalCost: 0,
            totalTokens: 0,
            errorCount: 0,
          });
        }

        const stats = providerMap.get(providerId)!;
        stats.requests++;
        stats.totalCost += parseFloat(String(request.cost)) || 0;
        stats.totalTokens += request.totalTokens || 0;
        stats.averageLatency += request.latencyMs || 0;
        if (request.status === 'error') {
          stats.errorCount++;
        }
      }

      // Calculate averages and rates
      for (const stats of providerMap.values()) {
        if (stats.requests > 0) {
          stats.averageLatency = stats.averageLatency / stats.requests;
          stats.successRate =
            ((stats.requests - stats.errorCount) / stats.requests) * 100;
        }
      }

      return Array.from(providerMap.values()).sort(
        (a, b) => b.requests - a.requests
      );
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get provider stats');
      throw error;
    }
  }

  /**
   * Get statistics by model
   */
  async getModelStats(
    orgId: string,
    timeRange: TimeRange
  ): Promise<ModelStats[]> {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.orgId, orgId),
            gte(requests.createdAt, timeRange.startDate),
            lte(requests.createdAt, timeRange.endDate)
          )
        );

      const modelMap = new Map<string, ModelStats>();

      for (const request of allRequests) {
        const model = request.model || 'unknown';
        const providerId = request.providerId || 'unknown';
        const key = `${providerId}:${model}`;

        if (!modelMap.has(key)) {
          modelMap.set(key, {
            model,
            providerId,
            requests: 0,
            totalTokens: 0,
            totalCost: 0,
            averageLatency: 0,
          });
        }

        const stats = modelMap.get(key)!;
        stats.requests++;
        stats.totalTokens += request.totalTokens || 0;
        stats.totalCost += parseFloat(String(request.cost)) || 0;
        stats.averageLatency += request.latencyMs || 0;
      }

      // Calculate averages
      for (const stats of modelMap.values()) {
        if (stats.requests > 0) {
          stats.averageLatency = stats.averageLatency / stats.requests;
        }
      }

      return Array.from(modelMap.values()).sort(
        (a, b) => b.requests - a.requests
      );
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get model stats');
      throw error;
    }
  }

  /**
   * Get cost breakdown with input/output costs and daily trends
   */
  async getCostBreakdown(
    orgId: string,
    timeRange: TimeRange
  ): Promise<CostBreakdown> {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.orgId, orgId),
            gte(requests.createdAt, timeRange.startDate),
            lte(requests.createdAt, timeRange.endDate)
          )
        )
        .orderBy(requests.createdAt);

      const breakdown: CostBreakdown = {
        total: 0,
        inputCost: 0,
        outputCost: 0,
        byProvider: {},
        byModel: {},
        byUser: {},
        trends: [],
      };

      // Map to track daily trends
      const trendsMap = new Map<string, { cost: number; requests: number }>();

      for (const request of allRequests) {
        const cost = parseFloat(String(request.cost)) || 0;
        breakdown.total += cost;

        // Calculate input/output cost ratio based on token counts
        // Assuming cost is split proportionally between input and output tokens
        const inputTokens = request.inputTokens || 0;
        const outputTokens = request.outputTokens || 0;
        const totalTokens = inputTokens + outputTokens;
        
        if (totalTokens > 0) {
          // Typically output tokens cost 2-4x more than input tokens
          // Using a 1:3 ratio for estimation (input:output cost per token)
          const inputWeight = inputTokens;
          const outputWeight = outputTokens * 3;
          const totalWeight = inputWeight + outputWeight;
          
          if (totalWeight > 0) {
            breakdown.inputCost += cost * (inputWeight / totalWeight);
            breakdown.outputCost += cost * (outputWeight / totalWeight);
          }
        }

        // By provider
        const providerId = request.providerId || 'unknown';
        breakdown.byProvider[providerId] =
          (breakdown.byProvider[providerId] || 0) + cost;

        // By model
        const model = request.model || 'unknown';
        breakdown.byModel[model] = (breakdown.byModel[model] || 0) + cost;

        // By API key (as proxy for user tracking)
        if (request.apiKeyId) {
          breakdown.byUser![request.apiKeyId] =
            (breakdown.byUser![request.apiKeyId] || 0) + cost;
        }

        // Track daily trends
        if (request.createdAt) {
          const dateKey = this.formatDateByGranularity(request.createdAt, 'day');
          const existing = trendsMap.get(dateKey) || { cost: 0, requests: 0 };
          existing.cost += cost;
          existing.requests += 1;
          trendsMap.set(dateKey, existing);
        }
      }

      // Convert trends map to sorted array
      breakdown.trends = Array.from(trendsMap.entries())
        .map(([date, data]) => ({
          date,
          cost: data.cost,
          requests: data.requests,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return breakdown;
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get cost breakdown');
      throw error;
    }
  }

  /**
   * Get top users by usage
   */
  async getTopUsers(
    orgId: string,
    timeRange: TimeRange,
    limit: number = 10
  ): Promise<TopUser[]> {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.orgId, orgId),
            gte(requests.createdAt, timeRange.startDate),
            lte(requests.createdAt, timeRange.endDate)
          )
        );

      const userMap = new Map<string, TopUser>();

      for (const request of allRequests) {
        // Use apiKeyId as proxy for user tracking since userId doesn't exist in schema
        if (!request.apiKeyId) continue;

        if (!userMap.has(request.apiKeyId)) {
          userMap.set(request.apiKeyId, {
            userId: request.apiKeyId,
            requests: 0,
            tokens: 0,
            cost: 0,
          });
        }

        const user = userMap.get(request.apiKeyId)!;
        user.requests++;
        user.tokens += request.totalTokens || 0;
        user.cost += parseFloat(String(request.cost)) || 0;
      }

      // Get user names
      const topUsers = Array.from(userMap.values())
        .sort((a, b) => b.cost - a.cost)
        .slice(0, limit);

      // Fetch user details
      const userIds = topUsers.map((u) => u.userId);
      if (userIds.length > 0) {
        const userDetails = await db
          .select({
            id: users.id,
            name: users.name,
          })
          .from(users)
          .where(sql`${users.id} IN ${userIds}`);

        const userDetailsMap = new Map(
          userDetails.map((u) => [u.id, u.name])
        );

        topUsers.forEach((user) => {
          user.userName = userDetailsMap.get(user.userId) || undefined;
        });
      }

      return topUsers;
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get top users');
      throw error;
    }
  }

  /**
   * Compare current period with previous period
   */
  async getComparison(
    orgId: string,
    currentRange: TimeRange
  ): Promise<{
    current: UsageMetrics;
    previous: UsageMetrics;
    changes: {
      requests: number;
      cost: number;
      tokens: number;
      errorRate: number;
    };
  }> {
    try {
      const duration =
        currentRange.endDate.getTime() - currentRange.startDate.getTime();

      const previousRange: TimeRange = {
        startDate: new Date(currentRange.startDate.getTime() - duration),
        endDate: new Date(currentRange.endDate.getTime() - duration),
      };

      const [current, previous] = await Promise.all([
        this.getUsageMetrics(orgId, currentRange),
        this.getUsageMetrics(orgId, previousRange),
      ]);

      const changes = {
        requests: this.calculatePercentageChange(
          previous.totalRequests,
          current.totalRequests
        ),
        cost: this.calculatePercentageChange(previous.totalCost, current.totalCost),
        tokens: this.calculatePercentageChange(
          previous.totalTokens,
          current.totalTokens
        ),
        errorRate: this.calculatePercentageChange(
          previous.errorRate,
          current.errorRate
        ),
      };

      return { current, previous, changes };
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get comparison');
      throw error;
    }
  }

  /**
   * Helper: Format date by granularity
   */
  private formatDateByGranularity(date: Date, granularity: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');

    switch (granularity) {
      case 'hour':
        return `${year}-${month}-${day} ${hour}:00`;
      case 'day':
        return `${year}-${month}-${day}`;
      case 'week':
        // Get week number
        const weekNumber = this.getWeekNumber(d);
        return `${year}-W${weekNumber}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Helper: Get week number
   */
  private getWeekNumber(date: Date): string {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return String(weekNo).padStart(2, '0');
  }

  /**
   * Helper: Calculate percentage change
   */
  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }
}

