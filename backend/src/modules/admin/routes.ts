/**
 * Admin API Routes
 * Administrative endpoints for managing users, organizations, and system
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AdminService } from './AdminService.js';
import { rateLimitService } from './RateLimitService.js';
import { routingPolicyService } from './RoutingPolicyService.js';
import { auditLogService } from './AuditLogService.js';
import { logger } from '../../utils/logger.js';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateOrganizationRequest,
  RateLimitConfig,
  RoutingPolicy,
} from './types.js';

// Type for authenticated user from JWT or API key
interface AuthUser {
  userId: string;
  orgId: string;
  role?: string;
}

let adminService: AdminService;

/**
 * Helper to get user ID from either JWT or API key auth
 */
function getUserId(request: FastifyRequest): string | undefined {
  const user = request.user as AuthUser | undefined;
  const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
  return user?.userId || apiKeyAuth?.userId;
}

/**
 * Middleware to check if user is admin
 * Works with both JWT tokens and API keys
 */
async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    let userId: string | undefined;
    let userRole: string | undefined;

    const user = request.user as AuthUser | undefined;
    const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;

    // Check if authenticated via JWT (dashboard user)
    if (user) {
      userId = user.userId;
      userRole = user.role;
    }
    // Check if authenticated via API key
    else if (apiKeyAuth) {
      userId = apiKeyAuth.userId;
      // Get user details from apiKey
      const userDetails = await adminService.getUser(userId!);
      userRole = userDetails?.role;
    }
    
    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Valid authentication required',
      });
    }
    
    if (userRole !== 'admin' && userRole !== 'owner') {
      return reply.code(403).send({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }
  } catch (error) {
    logger.error({ error }, 'Error in requireAdmin middleware');
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function adminRoutes(fastify: FastifyInstance) {
  // Initialize service
  adminService = new AdminService();

  // ===================================
  // User Management
  // ===================================

  /**
   * GET /api/v1/admin/users
   * List all users
   */
  fastify.get(
    '/api/v1/admin/users',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as any;
        const user = request.user as AuthUser | undefined;
        const apiKeyAuth = request.apiKeyAuth as AuthUser | undefined;
        const userId = user?.userId || apiKeyAuth?.userId;

        const result = await adminService.getUsers({
          orgId: query.orgId,
          isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
          limit: query.limit ? parseInt(query.limit) : undefined,
          offset: query.offset ? parseInt(query.offset) : undefined,
        });

        // Audit log
        if (userId) {
          auditLogService.log({
            userId,
            action: 'users.list',
            resource: 'users',
          });
        }

        return reply.code(200).send({
          success: true,
          data: result.users,
          total: result.total,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to list users');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/admin/users/:userId
   * Get user by ID
   */
  fastify.get(
    '/api/v1/admin/users/:userId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { userId: string };
        const userId = getUserId(request);

        const user = await adminService.getUser(params.userId);

        if (!user) {
          return reply.code(404).send({
            success: false,
            error: 'Not found',
            message: 'User not found',
          });
        }

        auditLogService.log({
          userId: userId!,
          action: 'users.get',
          resource: 'users',
          resourceId: params.userId,
        });

        return reply.code(200).send({
          success: true,
          data: user,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get user');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * POST /api/v1/admin/users
   * Create a new user
   */
  fastify.post(
    '/api/v1/admin/users',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as CreateUserRequest;
        const userId = getUserId(request);

        const user = await adminService.createUser(body);

        auditLogService.log({
          userId: userId!,
          action: 'users.create',
          resource: 'users',
          resourceId: user.id,
          changes: { email: body.email, role: body.role },
        });

        return reply.code(201).send({
          success: true,
          data: user,
          message: 'User created successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to create user');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * PUT /api/v1/admin/users/:userId
   * Update a user
   */
  fastify.put(
    '/api/v1/admin/users/:userId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { userId: string };
        const body = request.body as UpdateUserRequest;
        const userId = getUserId(request);

        const user = await adminService.updateUser(params.userId, body);

        auditLogService.log({
          userId: userId!,
          action: 'users.update',
          resource: 'users',
          resourceId: params.userId,
          changes: body,
        });

        return reply.code(200).send({
          success: true,
          data: user,
          message: 'User updated successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to update user');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * DELETE /api/v1/admin/users/:userId
   * Delete a user
   */
  fastify.delete(
    '/api/v1/admin/users/:userId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { userId: string };
        const userId = getUserId(request);

        await adminService.deleteUser(params.userId);

        auditLogService.log({
          userId: userId!,
          action: 'users.delete',
          resource: 'users',
          resourceId: params.userId,
        });

        return reply.code(200).send({
          success: true,
          message: 'User deleted successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to delete user');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // ===================================
  // Organization Management
  // ===================================

  /**
   * GET /api/v1/admin/organizations
   * List all organizations
   */
  fastify.get(
    '/api/v1/admin/organizations',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as any;
        const userId = getUserId(request);

        const result = await adminService.getOrganizations({
          isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
          limit: query.limit ? parseInt(query.limit) : undefined,
          offset: query.offset ? parseInt(query.offset) : undefined,
        });

        auditLogService.log({
          userId: userId!,
          action: 'organizations.list',
          resource: 'organizations',
        });

        return reply.code(200).send({
          success: true,
          data: result.orgs,
          total: result.total,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to list organizations');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/admin/organizations/:orgId
   * Get organization by ID
   */
  fastify.get(
    '/api/v1/admin/organizations/:orgId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { orgId: string };
        const userId = getUserId(request);

        const org = await adminService.getOrganization(params.orgId);

        if (!org) {
          return reply.code(404).send({
            success: false,
            error: 'Not found',
            message: 'Organization not found',
          });
        }

        auditLogService.log({
          userId: userId!,
          action: 'organizations.get',
          resource: 'organizations',
          resourceId: params.orgId,
        });

        return reply.code(200).send({
          success: true,
          data: org,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get organization');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * PUT /api/v1/admin/organizations/:orgId
   * Update an organization
   */
  fastify.put(
    '/api/v1/admin/organizations/:orgId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { orgId: string };
        const body = request.body as UpdateOrganizationRequest;
        const userId = getUserId(request);

        const org = await adminService.updateOrganization(params.orgId, body);

        auditLogService.log({
          userId: userId!,
          action: 'organizations.update',
          resource: 'organizations',
          resourceId: params.orgId,
          changes: body,
        });

        return reply.code(200).send({
          success: true,
          data: org,
          message: 'Organization updated successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to update organization');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // ===================================
  // System Statistics
  // ===================================

  /**
   * GET /api/v1/admin/stats
   * Get system-wide statistics
   */
  fastify.get(
    '/api/v1/admin/stats',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = getUserId(request);

        const stats = await adminService.getSystemStats();

        auditLogService.log({
          userId: userId!,
          action: 'stats.view',
          resource: 'system',
        });

        return reply.code(200).send({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get system stats');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // ===================================
  // Provider Management
  // ===================================

  /**
   * GET /api/v1/admin/providers
   * List all providers
   */
  fastify.get(
    '/api/v1/admin/providers',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = getUserId(request);

        const providers = await adminService.getProviders();

        auditLogService.log({
          userId: userId!,
          action: 'providers.list',
          resource: 'providers',
        });

        return reply.code(200).send({
          success: true,
          data: providers,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to list providers');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * PUT /api/v1/admin/providers/:providerId
   * Update a provider
   */
  fastify.put(
    '/api/v1/admin/providers/:providerId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { providerId: string };
        const body = request.body as any;
        const userId = getUserId(request);

        await adminService.updateProvider(params.providerId, body);

        auditLogService.log({
          userId: userId!,
          action: 'providers.update',
          resource: 'providers',
          resourceId: params.providerId,
          changes: body,
        });

        return reply.code(200).send({
          success: true,
          message: 'Provider updated successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to update provider');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // ===================================
  // Rate Limiting
  // ===================================

  /**
   * POST /api/v1/admin/rate-limits
   * Set rate limit configuration
   */
  fastify.post(
    '/api/v1/admin/rate-limits',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as RateLimitConfig;
        const userId = getUserId(request);

        rateLimitService.setConfig(body);

        auditLogService.log({
          userId: userId!,
          action: 'rate-limits.set',
          resource: 'rate-limits',
          changes: body,
        });

        return reply.code(200).send({
          success: true,
          message: 'Rate limit configuration set',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to set rate limit');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/admin/rate-limits
   * Get all rate limit configurations
   */
  fastify.get(
    '/api/v1/admin/rate-limits',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const configs = rateLimitService.getAllConfigs();

        return reply.code(200).send({
          success: true,
          data: configs,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get rate limits');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // ===================================
  // Routing Policies
  // ===================================

  /**
   * POST /api/v1/admin/routing-policies
   * Create a routing policy
   */
  fastify.post(
    '/api/v1/admin/routing-policies',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as RoutingPolicy;
        const userId = getUserId(request);

        routingPolicyService.addPolicy(body);

        auditLogService.log({
          userId: userId!,
          action: 'routing-policies.create',
          resource: 'routing-policies',
          changes: body,
        });

        return reply.code(201).send({
          success: true,
          message: 'Routing policy created',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to create routing policy');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/admin/routing-policies
   * Get all routing policies
   */
  fastify.get(
    '/api/v1/admin/routing-policies',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as any;
        
        let policies;
        if (query.orgId) {
          policies = routingPolicyService.getPolicies(query.orgId);
        } else {
          policies = routingPolicyService.getAllPolicies();
        }

        return reply.code(200).send({
          success: true,
          data: policies,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get routing policies');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * PUT /api/v1/admin/routing-policies/:policyId
   * Update a routing policy
   */
  fastify.put(
    '/api/v1/admin/routing-policies/:policyId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { policyId: string };
        const body = request.body as Partial<RoutingPolicy>;
        const userId = getUserId(request);

        routingPolicyService.updatePolicy(params.policyId, body);

        auditLogService.log({
          userId: userId!,
          action: 'routing-policies.update',
          resource: 'routing-policies',
          resourceId: params.policyId,
          changes: body,
        });

        return reply.code(200).send({
          success: true,
          message: 'Routing policy updated',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to update routing policy');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * DELETE /api/v1/admin/routing-policies/:policyId
   * Delete a routing policy
   */
  fastify.delete(
    '/api/v1/admin/routing-policies/:policyId',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = request.params as { policyId: string };
        const userId = getUserId(request);

        routingPolicyService.deletePolicy(params.policyId);

        auditLogService.log({
          userId: userId!,
          action: 'routing-policies.delete',
          resource: 'routing-policies',
          resourceId: params.policyId,
        });

        return reply.code(200).send({
          success: true,
          message: 'Routing policy deleted',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to delete routing policy');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // ===================================
  // Audit Logs
  // ===================================

  /**
   * GET /api/v1/admin/audit-logs
   * Get audit logs
   */
  fastify.get(
    '/api/v1/admin/audit-logs',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as any;

        const result = auditLogService.getLogs({
          userId: query.userId,
          action: query.action,
          resource: query.resource,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
          limit: query.limit ? parseInt(query.limit) : undefined,
          offset: query.offset ? parseInt(query.offset) : undefined,
        });

        return reply.code(200).send({
          success: true,
          data: result.logs,
          total: result.total,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get audit logs');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * GET /api/v1/admin/audit-logs/stats
   * Get audit log statistics
   */
  fastify.get(
    '/api/v1/admin/audit-logs/stats',
    {
      preHandler: [fastify.authenticateEither, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = auditLogService.getStatistics();

        return reply.code(200).send({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get audit log stats');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}

