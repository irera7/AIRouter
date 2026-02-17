/**
 * Realtime Service
 * Provides real-time metrics updates using Server-Sent Events (SSE)
 */

import { FastifyReply } from 'fastify';
import { logger } from '../../utils/logger.js';
import { AnalyticsService } from './AnalyticsService.js';
import { UsageMetrics } from './types.js';

interface RealtimeClient {
  id: string;
  orgId: string;
  reply: FastifyReply;
  lastUpdate: Date;
}

export class RealtimeService {
  private clients: Map<string, RealtimeClient> = new Map();
  private analyticsService: AnalyticsService;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_FREQUENCY = 5000; // 5 seconds

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Initialize realtime service
   */
  async initialize(): Promise<void> {
    logger.info('Initializing RealtimeService');

    // Start periodic updates
    this.updateInterval = setInterval(() => {
      this.broadcastUpdates().catch((error) => {
        logger.error({ error }, 'Error broadcasting updates');
      });
    }, this.UPDATE_FREQUENCY);

    logger.info('RealtimeService initialized');
  }

  /**
   * Stop realtime service
   */
  async stop(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Close all connections
    for (const client of this.clients.values()) {
      this.disconnectClient(client.id);
    }

    logger.info('RealtimeService stopped');
  }

  /**
   * Add a new SSE client
   */
  addClient(clientId: string, orgId: string, reply: FastifyReply): void {
    // Setup SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const client: RealtimeClient = {
      id: clientId,
      orgId,
      reply,
      lastUpdate: new Date(),
    };

    this.clients.set(clientId, client);

    logger.info({ clientId, orgId }, 'Realtime client connected');

    // Send initial data
    this.sendUpdate(client).catch((error) => {
      logger.error({ error, clientId }, 'Failed to send initial update');
    });

    // Handle client disconnect
    reply.raw.on('close', () => {
      this.disconnectClient(clientId);
    });
  }

  /**
   * Disconnect a client
   */
  disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.reply.raw.end();
      } catch (error) {
        // Ignore errors when closing
      }
      this.clients.delete(clientId);
      logger.info({ clientId }, 'Realtime client disconnected');
    }
  }

  /**
   * Broadcast updates to all connected clients
   */
  private async broadcastUpdates(): Promise<void> {
    const updates: Promise<void>[] = [];

    for (const client of this.clients.values()) {
      updates.push(this.sendUpdate(client));
    }

    await Promise.allSettled(updates);
  }

  /**
   * Send update to a specific client
   */
  private async sendUpdate(client: RealtimeClient): Promise<void> {
    try {
      // Get recent metrics (last 5 minutes)
      const timeRange = {
        startDate: new Date(Date.now() - 5 * 60 * 1000),
        endDate: new Date(),
      };

      const metrics = await this.analyticsService.getUsageMetrics(
        client.orgId,
        timeRange
      );

      const data = {
        timestamp: new Date().toISOString(),
        metrics,
      };

      // Send as SSE event
      this.sendEvent(client, 'metrics', data);

      client.lastUpdate = new Date();
    } catch (error) {
      logger.error({ error, clientId: client.id }, 'Failed to send update');
      // Don't throw - continue with other clients
    }
  }

  /**
   * Send a custom event to a client
   */
  sendEvent(client: RealtimeClient, eventType: string, data: any): void {
    try {
      const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
      client.reply.raw.write(message);
    } catch (error) {
      logger.error({ error, clientId: client.id }, 'Failed to send event');
      this.disconnectClient(client.id);
    }
  }

  /**
   * Send alert to all clients of an organization
   */
  async sendAlert(orgId: string, alert: any): Promise<void> {
    const orgClients = Array.from(this.clients.values()).filter(
      (c) => c.orgId === orgId
    );

    for (const client of orgClients) {
      this.sendEvent(client, 'alert', alert);
    }

    logger.info({ orgId, clientCount: orgClients.length }, 'Alert sent to clients');
  }

  /**
   * Get connected clients count
   */
  getClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get clients for an organization
   */
  getOrgClientsCount(orgId: string): number {
    return Array.from(this.clients.values()).filter(
      (c) => c.orgId === orgId
    ).length;
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

