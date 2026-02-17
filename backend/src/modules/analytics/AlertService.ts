/**
 * Alert Service
 * Manages usage alerts and threshold-based notifications
 */

import { db } from '../../db/index.js';
import { requests } from '../../db/schema/index.js';
import { eq, and, gte, sql } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import { AlertConfig, Alert } from './types.js';

export class AlertService {
  private alerts: Map<string, AlertConfig> = new Map();
  private triggeredAlerts: Map<string, Alert> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize alert service
   */
  async initialize(): Promise<void> {
    logger.info('Initializing AlertService');
    
    // Start periodic check (every 5 minutes)
    this.checkInterval = setInterval(() => {
      this.checkAlerts().catch((error) => {
        logger.error({ error }, 'Error checking alerts');
      });
    }, 5 * 60 * 1000);

    logger.info('AlertService initialized');
  }

  /**
   * Stop alert service
   */
  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('AlertService stopped');
  }

  /**
   * Add an alert configuration
   */
  addAlert(config: AlertConfig): void {
    const id = config.id || this.generateAlertId(config);
    this.alerts.set(id, { ...config, id });
    logger.info({ alertId: id, config }, 'Alert configuration added');
  }

  /**
   * Remove an alert configuration
   */
  removeAlert(alertId: string): void {
    this.alerts.delete(alertId);
    logger.info({ alertId }, 'Alert configuration removed');
  }

  /**
   * Get all alert configurations for an organization
   */
  getAlerts(orgId: string): AlertConfig[] {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.orgId === orgId
    );
  }

  /**
   * Get triggered alerts for an organization
   */
  getTriggeredAlerts(orgId: string): Alert[] {
    return Array.from(this.triggeredAlerts.values()).filter(
      (alert) => alert.orgId === orgId && !alert.resolved
    );
  }

  /**
   * Check all alerts
   */
  private async checkAlerts(): Promise<void> {
    for (const config of this.alerts.values()) {
      if (!config.enabled) continue;

      try {
        await this.checkAlert(config);
      } catch (error) {
        logger.error({ error, alertId: config.id }, 'Failed to check alert');
      }
    }
  }

  /**
   * Check a specific alert
   */
  private async checkAlert(config: AlertConfig): Promise<void> {
    const now = new Date();
    const timeRange = this.getTimeRangeForPeriod(config.period);

    let value: number;
    let shouldTrigger = false;

    switch (config.type) {
      case 'cost':
        value = await this.getTotalCost(config.orgId, timeRange);
        shouldTrigger = value >= config.threshold;
        break;

      case 'usage':
        value = await this.getTotalRequests(config.orgId, timeRange);
        shouldTrigger = value >= config.threshold;
        break;

      case 'error_rate':
        value = await this.getErrorRate(config.orgId, timeRange);
        shouldTrigger = value >= config.threshold;
        break;

      case 'latency':
        value = await this.getAverageLatency(config.orgId, timeRange);
        shouldTrigger = value >= config.threshold;
        break;

      default:
        logger.warn({ type: config.type }, 'Unknown alert type');
        return;
    }

    if (shouldTrigger) {
      await this.triggerAlert(config, value);
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(
    config: AlertConfig,
    value: number
  ): Promise<void> {
    const alertId = `${config.id}_${Date.now()}`;

    // Check if already triggered recently (within last hour)
    const existingAlert = Array.from(this.triggeredAlerts.values()).find(
      (a) =>
        a.configId === config.id &&
        !a.resolved &&
        Date.now() - a.triggeredAt.getTime() < 60 * 60 * 1000
    );

    if (existingAlert) {
      logger.debug({ alertId: config.id }, 'Alert already triggered recently');
      return;
    }

    const alert: Alert = {
      id: alertId,
      configId: config.id!,
      orgId: config.orgId,
      type: config.type,
      message: this.formatAlertMessage(config, value),
      value,
      threshold: config.threshold,
      triggeredAt: new Date(),
      resolved: false,
    };

    this.triggeredAlerts.set(alertId, alert);

    logger.warn({ alert }, 'Alert triggered');

    // Send notifications
    await this.sendNotifications(config, alert);
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(
    config: AlertConfig,
    alert: Alert
  ): Promise<void> {
    for (const channel of config.notificationChannels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(config, alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(config, alert);
            break;
        }
      } catch (error) {
        logger.error(
          { error, channel, alertId: alert.id },
          'Failed to send notification'
        );
      }
    }
  }

  /**
   * Send email notification (placeholder)
   */
  private async sendEmailNotification(
    _config: AlertConfig,
    alert: Alert
  ): Promise<void> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    logger.info({ alert }, 'Email notification would be sent');
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    config: AlertConfig,
    alert: Alert
  ): Promise<void> {
    if (!config.webhookUrl) {
      logger.warn({ alertId: alert.id }, 'Webhook URL not configured');
      return;
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert_id: alert.id,
          type: alert.type,
          message: alert.message,
          value: alert.value,
          threshold: alert.threshold,
          triggered_at: alert.triggeredAt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      logger.info({ alertId: alert.id }, 'Webhook notification sent');
    } catch (error) {
      logger.error({ error, alertId: alert.id }, 'Failed to send webhook');
      throw error;
    }
  }

  /**
   * Get time range for a period
   */
  private getTimeRangeForPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'hourly':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get total cost
   */
  private async getTotalCost(orgId: string, since: Date): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${requests.cost}), 0)`,
      })
      .from(requests)
      .where(and(eq(requests.orgId, orgId), gte(requests.createdAt, since)));

    return result[0]?.total || 0;
  }

  /**
   * Get total requests
   */
  private async getTotalRequests(orgId: string, since: Date): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(requests)
      .where(and(eq(requests.orgId, orgId), gte(requests.createdAt, since)));

    return result[0]?.count || 0;
  }

  /**
   * Get error rate
   */
  private async getErrorRate(orgId: string, since: Date): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`COUNT(*)`,
        errors: sql<number>`COUNT(CASE WHEN ${requests.status} = 'error' THEN 1 END)`,
      })
      .from(requests)
      .where(and(eq(requests.orgId, orgId), gte(requests.createdAt, since)));

    const total = result[0]?.total || 0;
    const errors = result[0]?.errors || 0;

    return total > 0 ? (errors / total) * 100 : 0;
  }

  /**
   * Get average latency
   */
  private async getAverageLatency(orgId: string, since: Date): Promise<number> {
    const result = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${requests.latencyMs}), 0)`,
      })
      .from(requests)
      .where(and(eq(requests.orgId, orgId), gte(requests.createdAt, since)));

    return result[0]?.avg || 0;
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(config: AlertConfig, value: number): string {
    const messages: Record<string, string> = {
      cost: `Cost threshold exceeded: $${value.toFixed(2)} (threshold: $${config.threshold})`,
      usage: `Usage threshold exceeded: ${value} requests (threshold: ${config.threshold})`,
      error_rate: `Error rate threshold exceeded: ${value.toFixed(2)}% (threshold: ${config.threshold}%)`,
      latency: `Latency threshold exceeded: ${value.toFixed(2)}ms (threshold: ${config.threshold}ms)`,
    };

    return messages[config.type] || `Alert triggered: ${value}`;
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(config: AlertConfig): string {
    return `alert_${config.orgId}_${config.type}_${Date.now()}`;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.triggeredAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      logger.info({ alertId }, 'Alert resolved');
    }
  }
}

