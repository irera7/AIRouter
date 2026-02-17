/**
 * Health Check Types
 * Types and interfaces for health monitoring
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    providers: HealthCheck;
  };
  metrics: {
    memory: MemoryMetrics;
    cpu: CPUMetrics;
  };
}

export interface HealthCheck {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  message?: string;
  lastCheck: string;
  details?: Record<string, any>;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  heapUsed: number;
  heapTotal: number;
}

export interface CPUMetrics {
  usage: number;
  loadAverage: number[];
}

export interface ReadinessCheck {
  ready: boolean;
  checks: {
    database: boolean;
    redis: boolean;
    providers: boolean;
  };
}

export interface LivenessCheck {
  alive: boolean;
  uptime: number;
}

