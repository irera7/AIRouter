/**
 * Health Check Service
 * Monitors system health and dependencies
 */

import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';
import { getRedisClient } from '../../utils/redis.js';
import { logger } from '../../utils/logger.js';
import { providerManager } from '../providers/ProviderManager.js';
import os from 'os';
import {
  HealthStatus,
  HealthCheck,
  MemoryMetrics,
  CPUMetrics,
  ReadinessCheck,
  LivenessCheck,
} from './types.js';

export class HealthService {
  private startTime: number;
  private version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.APP_VERSION || '0.1.0';
  }

  /**
   * Get comprehensive health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const [dbCheck, redisCheck, providersCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkProviders(),
    ]);

    const checks = {
      database: dbCheck,
      redis: redisCheck,
      providers: providersCheck,
    };

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (dbCheck.status === 'down' || redisCheck.status === 'down') {
      status = 'unhealthy';
    } else if (
      dbCheck.status === 'degraded' ||
      redisCheck.status === 'degraded' ||
      providersCheck.status === 'degraded'
    ) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: this.version,
      checks,
      metrics: {
        memory: this.getMemoryMetrics(),
        cpu: this.getCPUMetrics(),
      },
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      // Simple query to check connection
      await db.execute(sql`SELECT 1`);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 100 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: responseTime < 100 ? 'Database is healthy' : 'Database is slow',
      };
    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      const redis = getRedisClient();
      await redis.ping();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 50 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: responseTime < 50 ? 'Redis is healthy' : 'Redis is slow',
      };
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Redis connection failed',
      };
    }
  }

  /**
   * Check LLM providers status
   */
  private async checkProviders(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      const providers = providerManager.getAllProviders();
      const activeProviders = providers.filter((p) => p.config.isActive);
      
      const responseTime = Date.now() - startTime;
      
      if (activeProviders.length === 0) {
        return {
          status: 'down',
          responseTime,
          lastCheck: new Date().toISOString(),
          message: 'No active providers available',
          details: {
            total: providers.length,
            active: 0,
          },
        };
      }

      return {
        status: activeProviders.length >= 1 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: `${activeProviders.length} provider(s) active`,
        details: {
          total: providers.length,
          active: activeProviders.length,
          providers: activeProviders.map((p) => p.name),
        },
      };
    } catch (error) {
      logger.error({ error }, 'Provider health check failed');
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Provider check failed',
      };
    }
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      used: usedMem,
      total: totalMem,
      percentage: (usedMem / totalMem) * 100,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
    };
  }

  /**
   * Get CPU metrics
   */
  private getCPUMetrics(): CPUMetrics {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const usage = 100 - ~~(100 * totalIdle / totalTick);

    return {
      usage,
      loadAverage: os.loadavg(),
    };
  }

  /**
   * Get uptime in seconds
   */
  private getUptime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Readiness probe (Kubernetes-style)
   */
  async getReadiness(): Promise<ReadinessCheck> {
    const [dbCheck, redisCheck, providersCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkProviders(),
    ]);

    const ready =
      dbCheck.status !== 'down' &&
      redisCheck.status !== 'down' &&
      providersCheck.status !== 'down';

    return {
      ready,
      checks: {
        database: dbCheck.status !== 'down',
        redis: redisCheck.status !== 'down',
        providers: providersCheck.status !== 'down',
      },
    };
  }

  /**
   * Liveness probe (Kubernetes-style)
   */
  getLiveness(): LivenessCheck {
    return {
      alive: true,
      uptime: this.getUptime(),
    };
  }
}

// Singleton instance
export const healthService = new HealthService();

