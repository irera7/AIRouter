/**
 * Prometheus Metrics
 * Comprehensive metrics collection using prom-client
 */

import client from 'prom-client';
import { logger } from './logger.js';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// ═══════════════════════════════════════════════════════════
// HTTP Metrics
// ═══════════════════════════════════════════════════════════

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method', 'route'],
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// LLM Request Metrics
// ═══════════════════════════════════════════════════════════

export const llmRequestDuration = new client.Histogram({
  name: 'llm_request_duration_seconds',
  help: 'Duration of LLM requests in seconds',
  labelNames: ['provider', 'model', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const llmRequestTotal = new client.Counter({
  name: 'llm_requests_total',
  help: 'Total number of LLM requests',
  labelNames: ['provider', 'model', 'status'],
  registers: [register],
});

export const llmTokensTotal = new client.Counter({
  name: 'llm_tokens_total',
  help: 'Total number of tokens processed',
  labelNames: ['provider', 'model', 'type'], // type: input/output
  registers: [register],
});

export const llmCostTotal = new client.Counter({
  name: 'llm_cost_total',
  help: 'Total cost of LLM requests in USD',
  labelNames: ['provider', 'model'],
  registers: [register],
});

export const llmErrorsTotal = new client.Counter({
  name: 'llm_errors_total',
  help: 'Total number of LLM errors',
  labelNames: ['provider', 'model', 'error_type'],
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// Cache Metrics
// ═══════════════════════════════════════════════════════════

export const cacheHitTotal = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  registers: [register],
});

export const cacheMissTotal = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  registers: [register],
});

export const cacheSize = new client.Gauge({
  name: 'cache_size_bytes',
  help: 'Current size of cache in bytes',
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// Database Metrics
// ═══════════════════════════════════════════════════════════

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbConnectionsActive = new client.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// Rate Limiting Metrics
// ═══════════════════════════════════════════════════════════

export const rateLimitHits = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['identifier', 'type'], // type: user/org
  registers: [register],
});

export const rateLimitBlocks = new client.Counter({
  name: 'rate_limit_blocks_total',
  help: 'Total number of requests blocked by rate limiter',
  labelNames: ['identifier', 'type', 'reason'],
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// Business Metrics
// ═══════════════════════════════════════════════════════════

export const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [register],
});

export const activeOrganizations = new client.Gauge({
  name: 'active_organizations',
  help: 'Number of active organizations',
  registers: [register],
});

export const totalRevenue = new client.Counter({
  name: 'revenue_total_usd',
  help: 'Total revenue in USD',
  labelNames: ['org_id', 'plan'],
  registers: [register],
});

export const creditBalance = new client.Gauge({
  name: 'credit_balance_usd',
  help: 'Current credit balance per organization',
  labelNames: ['org_id'],
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// System Health Metrics
// ═══════════════════════════════════════════════════════════

export const healthStatus = new client.Gauge({
  name: 'health_status',
  help: 'Health status of dependencies (1=healthy, 0=unhealthy)',
  labelNames: ['component'], // database, redis, provider
  registers: [register],
});

export const uptimeSeconds = new client.Gauge({
  name: 'uptime_seconds',
  help: 'Application uptime in seconds',
  registers: [register],
});

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Track HTTP request
 */
export function trackHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  duration: number
) {
  httpRequestTotal.inc({ method, route, status_code: statusCode });
  httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
}

/**
 * Track LLM request
 */
export function trackLLMRequest(
  provider: string,
  model: string,
  status: 'success' | 'error',
  duration: number,
  inputTokens: number,
  outputTokens: number,
  cost: number
) {
  llmRequestTotal.inc({ provider, model, status });
  llmRequestDuration.observe({ provider, model, status }, duration);
  llmTokensTotal.inc({ provider, model, type: 'input' }, inputTokens);
  llmTokensTotal.inc({ provider, model, type: 'output' }, outputTokens);
  llmCostTotal.inc({ provider, model }, cost);
}

/**
 * Track cache hit/miss
 */
export function trackCache(hit: boolean) {
  if (hit) {
    cacheHitTotal.inc();
  } else {
    cacheMissTotal.inc();
  }
}

/**
 * Initialize uptime tracking
 */
const startTime = Date.now();
setInterval(() => {
  uptimeSeconds.set((Date.now() - startTime) / 1000);
}, 10000); // Update every 10 seconds

logger.info('Prometheus metrics initialized');

