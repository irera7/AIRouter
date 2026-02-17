/**
 * Export Service
 * Handles exporting analytics data in various formats
 */

import { db } from '../../db/index.js';
import { requests } from '../../db/schema/index.js';
import { eq, and, gte, lte } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import { ExportOptions, TimeRange } from './types.js';

export class ExportService {
  /**
   * Export data to CSV format
   */
  async exportToCSV(
    orgId: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      logger.info({ orgId, options }, 'Exporting data to CSV');

      const data = await this.fetchData(orgId, options.timeRange);

      if (data.length === 0) {
        return 'No data available for the selected time range\n';
      }

      // CSV headers
      const headers = [
        'Date',
        'Provider',
        'Model',
        'Status',
        'Tokens',
        'Cost',
        'Latency (ms)',
        'Cached',
      ];

      let csv = headers.join(',') + '\n';

      // CSV rows
      for (const row of data) {
        const values = [
          row.createdAt?.toISOString() || '',
          row.providerId || '',
          row.model || '',
          row.status || '',
          row.totalTokens?.toString() || '0',
          String(row.cost) || '0',
          row.latencyMs?.toString() || '0',
          row.metadata?.fallbackUsed === false ? 'Yes' : 'No',
        ];
        csv += values.map((v) => `"${v}"`).join(',') + '\n';
      }

      return csv;
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to export to CSV');
      throw error;
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(
    orgId: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      logger.info({ orgId, options }, 'Exporting data to JSON');

      const data = await this.fetchData(orgId, options.timeRange);

      if (options.includeDetails) {
        return JSON.stringify(data, null, 2);
      }

      // Simplified format
      const simplified = data.map((row) => ({
        date: row.createdAt?.toISOString(),
        provider: row.providerId,
        model: row.model,
        status: row.status,
        tokens: row.totalTokens,
        cost: row.cost,
        latency: row.latencyMs,
        cached: row.metadata?.fallbackUsed === false,
      }));

      return JSON.stringify(simplified, null, 2);
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to export to JSON');
      throw error;
    }
  }

  /**
   * Export aggregated data (grouped by provider, model, or day)
   */
  async exportAggregated(
    orgId: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      const data = await this.fetchData(orgId, options.timeRange);
      const groupBy = options.groupBy || 'day';

      const aggregated = this.aggregateData(data, groupBy);

      if (options.format === 'csv') {
        return this.aggregatedToCSV(aggregated, groupBy);
      } else {
        return JSON.stringify(aggregated, null, 2);
      }
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to export aggregated data');
      throw error;
    }
  }

  /**
   * Fetch data from database
   */
  private async fetchData(orgId: string, timeRange: TimeRange) {
    return await db
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
  }

  /**
   * Aggregate data by specified dimension
   */
  private aggregateData(data: any[], groupBy: string): any[] {
    const groups = new Map<string, any>();

    for (const row of data) {
      let key: string;

      switch (groupBy) {
        case 'provider':
          key = row.providerId || 'unknown';
          break;
        case 'model':
          key = row.model || 'unknown';
          break;
        case 'day':
          key = row.createdAt
            ? new Date(row.createdAt).toISOString().split('T')[0]
            : 'unknown';
          break;
        default:
          key = 'all';
      }

      if (!groups.has(key)) {
        groups.set(key, {
          [groupBy]: key,
          requests: 0,
          totalTokens: 0,
          totalCost: 0,
          averageLatency: 0,
          successCount: 0,
          errorCount: 0,
          cachedCount: 0,
        });
      }

      const group = groups.get(key)!;
      group.requests++;
      group.totalTokens += row.totalTokens || 0;
      group.totalCost += row.cost || 0;
      group.averageLatency += row.latencyMs || 0;
      if (row.status === 'success') group.successCount++;
      if (row.status === 'error') group.errorCount++;
      if (row.cached) group.cachedCount++;
    }

    // Calculate averages
    for (const group of groups.values()) {
      if (group.requests > 0) {
        group.averageLatency = group.averageLatency / group.requests;
        group.successRate =
          (group.successCount / group.requests) * 100;
        group.cacheHitRate =
          (group.cachedCount / group.requests) * 100;
      }
    }

    return Array.from(groups.values());
  }

  /**
   * Convert aggregated data to CSV
   */
  private aggregatedToCSV(data: any[], groupBy: string): string {
    if (data.length === 0) {
      return 'No data available\n';
    }

    const headers = [
      groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
      'Requests',
      'Total Tokens',
      'Total Cost',
      'Avg Latency',
      'Success Rate %',
      'Cache Hit Rate %',
    ];

    let csv = headers.join(',') + '\n';

    for (const row of data) {
      const values = [
        row[groupBy],
        row.requests,
        row.totalTokens,
        row.totalCost.toFixed(4),
        row.averageLatency.toFixed(2),
        row.successRate?.toFixed(2) || '0',
        row.cacheHitRate?.toFixed(2) || '0',
      ];
      csv += values.map((v) => `"${v}"`).join(',') + '\n';
    }

    return csv;
  }

  /**
   * Get export file name
   */
  getFileName(format: string, prefix: string = 'analytics'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.${format}`;
  }
}

