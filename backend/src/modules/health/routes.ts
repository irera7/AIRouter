/**
 * Health Check Routes
 * Endpoints for monitoring and health checks
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthService } from './HealthService.js';
import { logger } from '../../utils/logger.js';
import { register } from '../../utils/metrics.js';

export async function healthRoutes(fastify: FastifyInstance) {
  /**
   * GET /health
   * Comprehensive health check
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await healthService.getHealthStatus();

      const statusCode = health.status === 'healthy' ? 200 : 
                         health.status === 'degraded' ? 200 : 503;

      return reply.code(statusCode).send(health);
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /health/readiness
   * Kubernetes readiness probe
   */
  fastify.get('/health/readiness', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const readiness = await healthService.getReadiness();
      
      return reply.code(readiness.ready ? 200 : 503).send(readiness);
    } catch (error) {
      logger.error({ error }, 'Readiness check failed');
      return reply.code(503).send({
        ready: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /health/liveness
   * Kubernetes liveness probe
   */
  fastify.get('/health/liveness', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const liveness = healthService.getLiveness();
      return reply.code(200).send(liveness);
    } catch (error) {
      logger.error({ error }, 'Liveness check failed');
      return reply.code(503).send({
        alive: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /metrics
   * Prometheus-compatible metrics endpoint
   */
  fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = await register.metrics();
      
      return reply
        .code(200)
        .header('Content-Type', register.contentType)
        .send(metrics);
    } catch (error) {
      logger.error({ error }, 'Metrics endpoint failed');
      return reply.code(500).send('Error generating metrics');
    }
  });
}

