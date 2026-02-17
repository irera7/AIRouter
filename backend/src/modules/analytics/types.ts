/**
 * Analytics Module Types
 * Types and interfaces for usage tracking and analytics
 */

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface UsageTrend {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
  errors: number;
}

export interface ProviderStats {
  providerId: string;
  providerName: string;
  requests: number;
  successRate: number;
  averageLatency: number;
  totalCost: number;
  totalTokens: number;
  errorCount: number;
}

export interface ModelStats {
  model: string;
  providerId: string;
  requests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
}

export interface CostBreakdown {
  total: number;
  inputCost: number;
  outputCost: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  byUser?: Record<string, number>;
  trends?: Array<{
    date: string;
    cost: number;
    requests: number;
  }>;
}

export interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  errorRate: number;
  cacheHitRate: number;
}

export interface TopUser {
  userId: string;
  userName?: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface AnalyticsSummary {
  timeRange: TimeRange;
  metrics: UsageMetrics;
  trends: UsageTrend[];
  providerStats: ProviderStats[];
  modelStats: ModelStats[];
  costBreakdown: CostBreakdown;
  topUsers?: TopUser[];
}

export interface AlertConfig {
  id?: string;
  orgId: string;
  type: 'cost' | 'usage' | 'error_rate' | 'latency';
  threshold: number;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  notificationChannels: ('email' | 'webhook')[];
  webhookUrl?: string;
}

export interface Alert {
  id: string;
  configId: string;
  orgId: string;
  type: string;
  message: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
  resolved: boolean;
}

export type ExportFormat = 'csv' | 'json' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  timeRange: TimeRange;
  includeDetails?: boolean;
  groupBy?: 'provider' | 'model' | 'user' | 'day';
}

