/**
 * Audit Log Service
 * Tracks all admin actions for security and compliance
 */

import { logger } from '../../utils/logger.js';
import { AuditLog } from './types.js';

export class AuditLogService {
  private logs: AuditLog[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  /**
   * Log an action
   */
  log(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
      ...entry,
      id: this.generateLogId(),
      timestamp: new Date(),
    };

    this.logs.unshift(auditLog); // Add to beginning

    // Trim if exceeded max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    logger.info(
      {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
      },
      'Audit log entry created'
    );
  }

  /**
   * Get logs with filtering
   */
  getLogs(options: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): { logs: AuditLog[]; total: number } {
    let filtered = [...this.logs];

    // Apply filters
    if (options.userId) {
      filtered = filtered.filter((log) => log.userId === options.userId);
    }
    if (options.action) {
      filtered = filtered.filter((log) => log.action.includes(options.action!));
    }
    if (options.resource) {
      filtered = filtered.filter((log) => log.resource === options.resource);
    }
    if (options.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= options.endDate!);
    }

    const total = filtered.length;
    const offset = options.offset || 0;
    const limit = options.limit || 100;

    return {
      logs: filtered.slice(offset, offset + limit),
      total,
    };
  }

  /**
   * Get log by ID
   */
  getLog(logId: string): AuditLog | null {
    return this.logs.find((log) => log.id === logId) || null;
  }

  /**
   * Clear old logs
   */
  clearOldLogs(olderThan: Date): number {
    const initialCount = this.logs.length;
    this.logs = this.logs.filter((log) => log.timestamp > olderThan);
    const removed = initialCount - this.logs.length;

    logger.info({ removed, olderThan }, 'Old audit logs cleared');
    return removed;
  }

  /**
   * Generate log ID
   */
  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Export logs to JSON
   */
  exportLogs(options: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): string {
    const { logs } = this.getLogs({
      ...options,
      limit: 100000, // Export all matching
    });

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalLogs: number;
    actionsBreakdown: Record<string, number>;
    topUsers: Array<{ userId: string; userName?: string; count: number }>;
    recentActivity: AuditLog[];
  } {
    const actionsBreakdown: Record<string, number> = {};
    const userCounts: Map<string, { userName?: string; count: number }> = new Map();

    for (const log of this.logs) {
      // Count actions
      actionsBreakdown[log.action] = (actionsBreakdown[log.action] || 0) + 1;

      // Count by user
      if (!userCounts.has(log.userId)) {
        userCounts.set(log.userId, { userName: log.userName, count: 0 });
      }
      userCounts.get(log.userId)!.count++;
    }

    // Get top 10 users
    const topUsers = Array.from(userCounts.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: this.logs.length,
      actionsBreakdown,
      topUsers,
      recentActivity: this.logs.slice(0, 20),
    };
  }
}

// Singleton instance
export const auditLogService = new AuditLogService();

