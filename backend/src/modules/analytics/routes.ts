/**
 * Analytics API Routes
 * Endpoints for analytics, exports, and alerts
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from './AnalyticsService.js';
import { ExportService } from './ExportService.js';
import { AlertService } from './AlertService.js';
import { realtimeService } from './RealtimeService.js';
import { logger } from '../../utils/logger.js';
import { TimeRange, AlertConfig } from './types.js';
import { db } from '../../db/index.js';
import { requests, providers, apiKeys } from '../../db/schema/index.js';
import { eq, and, gte, lte, sql, desc, inArray } from 'drizzle-orm';

let analyticsService: AnalyticsService;
let exportService: ExportService;
let alertService: AlertService;

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Initialize services
  analyticsService = new AnalyticsService();
  exportService = new ExportService();
  alertService = new AlertService();
  await alertService.initialize();
  await realtimeService.initialize();

  /**
   * GET /api/v1/analytics/summary
   * Get comprehensive analytics summary
   */
  fastify.get(
    '/api/v1/analytics/summary',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get user info from JWT token
        const user = request.user as any;
        const query = request.query as any;

        // Parse time range
        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        logger.info({
          orgId: user.orgId,
          timeRange,
        }, 'Getting analytics summary');

        const summary = await analyticsService.getAnalyticsSummary(
          user.orgId,
          timeRange
        );

        return reply.code(200).send({
          success: true,
          data: summary,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get analytics summary');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/requests
   * Get detailed request logs for usage table
   */
  fastify.get(
    '/api/v1/analytics/requests',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        // Parse pagination
        const page = parseInt(query.page) || 1;
        const limit = Math.min(parseInt(query.limit) || 50, 100); // Max 100 per page
        const offset = (page - 1) * limit;

        // Parse time range
        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        logger.info({
          orgId: user.orgId,
          timeRange,
          page,
          limit,
        }, 'Getting request logs');

        // Fetch requests with provider and API key info
        const requestsData = await db
          .select({
            id: requests.id,
            model: requests.model,
            status: requests.status,
            inputTokens: requests.inputTokens,
            outputTokens: requests.outputTokens,
            totalTokens: requests.totalTokens,
            cost: requests.cost,
            latencyMs: requests.latencyMs,
            createdAt: requests.createdAt,
            providerId: requests.providerId,
            apiKeyId: requests.apiKeyId,
            cached: requests.metadata,
          })
          .from(requests)
          .where(
            and(
              eq(requests.orgId, user.orgId),
              gte(requests.createdAt, timeRange.startDate),
              lte(requests.createdAt, timeRange.endDate)
            )
          )
          .orderBy(desc(requests.createdAt))
          .limit(limit)
          .offset(offset);

        // Get provider names
        const providerIds = [...new Set(requestsData.map(r => r.providerId).filter((id): id is string => id !== null))];
        const providersData = providerIds.length > 0 ? await db
          .select({
            id: providers.id,
            name: providers.name,
            displayName: providers.displayName,
          })
          .from(providers)
          .where(inArray(providers.id, providerIds)) : [];

        const providerMap = new Map(providersData.map(p => [p.id, p]));

        // Get API key names
        const apiKeyIds = [...new Set(requestsData.map(r => r.apiKeyId).filter((id): id is string => id !== null))];
        const apiKeysData = apiKeyIds.length > 0 ? await db
          .select({
            id: apiKeys.id,
            name: apiKeys.name,
          })
          .from(apiKeys)
          .where(inArray(apiKeys.id, apiKeyIds)) : [];

        const apiKeyMap = new Map(apiKeysData.map(k => [k.id, k]));

        // Format response
        const formattedRequests = requestsData.map(req => {
          const provider = req.providerId ? providerMap.get(req.providerId) : null;
          const apiKey = req.apiKeyId ? apiKeyMap.get(req.apiKeyId) : null;
          const cached = (req.cached as any)?.fallbackUsed || false;

          return {
            id: req.id,
            timestamp: req.createdAt,
            provider: provider?.displayName || 'Unknown',
            model: req.model,
            app: apiKey?.name || 'N/A',
            tokens: {
              input: req.inputTokens,
              output: req.outputTokens,
              total: req.totalTokens,
            },
            cost: req.cost, // in cents
            speed: req.latencyMs,
            status: req.status,
            cached,
          };
        });

        // Get total count for pagination
        const totalResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(requests)
          .where(
            and(
              eq(requests.orgId, user.orgId),
              gte(requests.createdAt, timeRange.startDate),
              lte(requests.createdAt, timeRange.endDate)
            )
          );

        const total = totalResult[0]?.count || 0;

        return reply.code(200).send({
          success: true,
          data: {
            requests: formattedRequests,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          },
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get request logs');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/metrics
   * Get usage metrics
   */
  fastify.get(
    '/api/v1/analytics/metrics',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        // Parse time range from query parameter (support both specific dates and presets like '30d', '7d')
        let startDate: Date;
        let endDate: Date = new Date();

        if (query.timeRange) {
          const match = query.timeRange.match(/^(\d+)([dhwm])$/); // e.g., "30d", "7d", "24h"
          if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            startDate = new Date();
            
            switch (unit) {
              case 'h': // hours
                startDate.setHours(startDate.getHours() - value);
                break;
              case 'd': // days
                startDate.setDate(startDate.getDate() - value);
                break;
              case 'w': // weeks
                startDate.setDate(startDate.getDate() - (value * 7));
                break;
              case 'm': // months
                startDate.setMonth(startDate.getMonth() - value);
                break;
              default:
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
            }
          } else {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
          }
        } else if (query.startDate) {
          startDate = new Date(query.startDate);
        } else {
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
        }

        if (query.endDate) {
          endDate = new Date(query.endDate);
        }

        const timeRange: TimeRange = { startDate, endDate };

        const metrics = await analyticsService.getUsageMetrics(
          user.orgId,
          timeRange
        );

        return reply.code(200).send({
          success: true,
          data: metrics,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get metrics');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/trends
   * Get usage trends over time
   */
  fastify.get(
    '/api/v1/analytics/trends',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        const granularity = query.granularity || 'day';

        const trends = await analyticsService.getUsageTrends(
          user.orgId,
          timeRange,
          granularity
        );

        return reply.code(200).send({
          success: true,
          data: trends,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get trends');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/providers
   * Get provider statistics
   */
  fastify.get(
    '/api/v1/analytics/providers',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        const stats = await analyticsService.getProviderStats(
          user.orgId,
          timeRange
        );

        return reply.code(200).send({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get provider stats');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/models
   * Get model statistics
   */
  fastify.get(
    '/api/v1/analytics/models',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        const stats = await analyticsService.getModelStats(
          user.orgId,
          timeRange
        );

        return reply.code(200).send({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get model stats');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/cost-breakdown
   * Get cost breakdown
   */
  fastify.get(
    '/api/v1/analytics/cost-breakdown',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        const breakdown = await analyticsService.getCostBreakdown(
          user.orgId,
          timeRange
        );

        return reply.code(200).send({
          success: true,
          data: breakdown,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get cost breakdown');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/comparison
   * Compare current period with previous period
   */
  fastify.get(
    '/api/v1/analytics/comparison',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        const comparison = await analyticsService.getComparison(
          user.orgId,
          timeRange
        );

        return reply.code(200).send({
          success: true,
          data: comparison,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get comparison');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/export
   * Export analytics data
   */
  fastify.get(
    '/api/v1/analytics/export',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const query = request.query as any;

        const format = query.format || 'json';
        const groupBy = query.groupBy;

        const timeRange: TimeRange = {
          startDate: query.startDate
            ? new Date(query.startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: query.endDate ? new Date(query.endDate) : new Date(),
        };

        let data: string;
        let contentType: string;

        if (groupBy) {
          data = await exportService.exportAggregated(user.orgId, {
            format,
            timeRange,
            groupBy,
          });
        } else if (format === 'csv') {
          data = await exportService.exportToCSV(user.orgId, {
            format: 'csv',
            timeRange,
          });
        } else {
          data = await exportService.exportToJSON(user.orgId, {
            format: 'json',
            timeRange,
            includeDetails: query.includeDetails === 'true',
          });
        }

        contentType = format === 'csv' ? 'text/csv' : 'application/json';
        const fileName = exportService.getFileName(format);

        reply.header('Content-Type', contentType);
        reply.header('Content-Disposition', `attachment; filename="${fileName}"`);

        return reply.code(200).send(data);
      } catch (error) {
        logger.error({ error }, 'Failed to export data');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * POST /api/v1/analytics/alerts
   * Create an alert configuration
   */
  fastify.post(
    '/api/v1/analytics/alerts',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const body = request.body as AlertConfig;

        body.orgId = user.orgId;
        alertService.addAlert(body);

        return reply.code(201).send({
          success: true,
          message: 'Alert configuration created',
          data: body,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to create alert');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/alerts
   * Get alert configurations
   */
  fastify.get(
    '/api/v1/analytics/alerts',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;

        const alerts = alertService.getAlerts(user.orgId);

        return reply.code(200).send({
          success: true,
          data: alerts,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get alerts');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/alerts/triggered
   * Get triggered alerts
   */
  fastify.get(
    '/api/v1/analytics/alerts/triggered',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;

        const alerts = alertService.getTriggeredAlerts(user.orgId);

        return reply.code(200).send({
          success: true,
          data: alerts,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get triggered alerts');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * DELETE /api/v1/analytics/alerts/:alertId
   * Delete an alert configuration
   */
  fastify.delete(
    '/api/v1/analytics/alerts/:alertId',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { alertId: string };

        alertService.removeAlert(params.alertId);

        return reply.code(200).send({
          success: true,
          message: 'Alert configuration deleted',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to delete alert');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/realtime
   * Real-time metrics stream (Server-Sent Events)
   */
  fastify.get(
    '/api/v1/analytics/realtime',
    {
      preHandler: [fastify.authenticate], // Use JWT authentication for dashboard
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        logger.info({ clientId, orgId: user.orgId }, 'Starting realtime stream');

        realtimeService.addClient(clientId, user.orgId, reply);

        // Connection will be kept alive by the RealtimeService
      } catch (error) {
        logger.error({ error }, 'Failed to start realtime stream');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}

export { alertService };

