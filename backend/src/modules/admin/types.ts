/**
 * Admin Module Types
 * Types and interfaces for admin panel functionality
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  orgId: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'member';
  orgId: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'admin' | 'member';
}

export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  plan: string;
  creditBalance: string; // Stored as numeric string in DB
  createdAt: Date;
  updatedAt: Date;
  users: AdminUser[];
}

export interface UpdateOrganizationRequest {
  name?: string;
  plan?: string;
  creditBalance?: string; // Must be string for numeric DB column
}

export interface RateLimitConfig {
  id?: string;
  orgId?: string;
  userId?: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerMinute?: number;
  tokensPerDay?: number;
  enabled: boolean;
}

export interface RoutingPolicy {
  id?: string;
  orgId: string;
  name: string;
  description?: string;
  priority: number;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  enabled: boolean;
  createdAt?: Date;
}

export interface PolicyCondition {
  type: 'model' | 'cost' | 'time' | 'user' | 'org';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: any;
}

export interface PolicyAction {
  type: 'route_to' | 'fallback' | 'reject' | 'cache' | 'rate_limit';
  params: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SystemStats {
  totalUsers: number;
  totalOrgs: number;
  activeUsers: number;
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  averageLatency: number;
  errorRate: number;
  cacheHitRate: number;
}

export interface ProviderManagement {
  id: string;
  name: string;
  displayName: string;
  type: 'openai' | 'anthropic' | 'custom' | 'mock';
  isActive: boolean;
  config: Record<string, any>;
  pricing: {
    inputTokenPrice: number;
    outputTokenPrice: number;
  };
  metrics: {
    totalRequests: number;
    successRate: number;
    averageLatency: number;
  };
}

