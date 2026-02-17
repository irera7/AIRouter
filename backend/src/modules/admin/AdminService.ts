/**
 * Admin Service
 * Core business logic for admin panel operations
 */

import { db } from '../../db/index.js';
import { users, orgs, providers, requests, apiKeys } from '../../db/schema/index.js';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import bcrypt from 'bcryptjs';
import {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  OrganizationDetails,
  UpdateOrganizationRequest,
  SystemStats,
  ProviderManagement,
} from './types.js';

export class AdminService {
  /**
   * Get all users with filtering and pagination
   */
  async getUsers(options: {
    orgId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ users: AdminUser[]; total: number }> {
    try {
      const conditions = [];
      
      if (options.orgId) {
        conditions.push(eq(users.orgId, options.orgId));
      }

      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          orgId: users.orgId,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(options.limit || 100)
        .offset(options.offset || 0);

      const totalCount = await db
        .select({ count: count() })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        users: allUsers as AdminUser[],
        total: totalCount[0]?.count || 0,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get users');
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<AdminUser | null> {
    try {
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          orgId: users.orgId,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user[0] as AdminUser || null;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user');
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<AdminUser> {
    try {
      // Check if email already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name,
        role: data.role,
        orgId: data.orgId,
      })
        .returning();

      logger.info({ userId: newUser[0].id, email: data.email }, 'User created');

      return newUser[0] as AdminUser;
    } catch (error) {
      logger.error({ error, email: data.email }, 'Failed to create user');
      throw error;
    }
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<AdminUser> {
    try {
      const updated = await db
        .update(users)
        .set(data)
        .where(eq(users.id, userId))
        .returning();

      if (updated.length === 0) {
        throw new Error('User not found');
      }

      logger.info({ userId, changes: data }, 'User updated');

      return updated[0] as AdminUser;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to update user');
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user (or implement soft delete with a dedicated field if needed)
      await db
        .delete(users)
        .where(eq(users.id, userId));

      logger.info({ userId }, 'User deleted');
    } catch (error) {
      logger.error({ error, userId }, 'Failed to delete user');
      throw error;
    }
  }

  /**
   * Get all organizations
   */
  async getOrganizations(options: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ orgs: OrganizationDetails[]; total: number }> {
    try {
      const allOrgs = await db
        .select()
        .from(orgs)
        .orderBy(desc(orgs.createdAt))
        .limit(options.limit || 100)
        .offset(options.offset || 0);

      const totalCount = await db
        .select({ count: count() })
        .from(orgs);

      // Get users for each org
      const orgsWithUsers = await Promise.all(
        allOrgs.map(async (org) => {
          const orgUsers = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
              orgId: users.orgId,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.orgId, org.id));

          return {
            ...org,
            users: orgUsers as AdminUser[],
          } as OrganizationDetails;
        })
      );

      return {
        orgs: orgsWithUsers,
        total: totalCount[0]?.count || 0,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get organizations');
      throw error;
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(orgId: string): Promise<OrganizationDetails | null> {
    try {
      const org = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, orgId))
        .limit(1);

      if (org.length === 0) {
        return null;
      }

      // Get users
      const orgUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          orgId: users.orgId,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.orgId, orgId));

      return {
        ...org[0],
        users: orgUsers as AdminUser[],
      } as OrganizationDetails;
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get organization');
      throw error;
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(
    orgId: string,
    data: UpdateOrganizationRequest
  ): Promise<OrganizationDetails> {
    try {
      const updated = await db
        .update(orgs)
        .set(data)
        .where(eq(orgs.id, orgId))
        .returning();

      if (updated.length === 0) {
        throw new Error('Organization not found');
      }

      logger.info({ orgId, changes: data }, 'Organization updated');

      return await this.getOrganization(orgId) as OrganizationDetails;
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to update organization');
      throw error;
    }
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const [
        totalUsersResult,
        totalOrgsResult,
        activeUsersResult,
        requestStats,
      ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(orgs),
        db.select({ count: count() }).from(users),
        db.select({
          totalRequests: count(),
          totalCost: sql<number>`COALESCE(SUM(${requests.cost}), 0)`,
          totalTokens: sql<number>`COALESCE(SUM(${requests.totalTokens}), 0)`,
          avgLatency: sql<number>`COALESCE(AVG(${requests.latencyMs}), 0)`,
          errorCount: sql<number>`COUNT(CASE WHEN ${requests.status} = 'error' THEN 1 END)`,
        }).from(requests),
      ]);

      const stats = requestStats[0];
      const totalRequests = Number(stats.totalRequests) || 0;
      const errorCount = Number(stats.errorCount) || 0;

      return {
        totalUsers: totalUsersResult[0]?.count || 0,
        totalOrgs: totalOrgsResult[0]?.count || 0,
        activeUsers: activeUsersResult[0]?.count || 0,
        totalRequests,
        totalCost: Number(stats.totalCost) || 0,
        totalTokens: Number(stats.totalTokens) || 0,
        averageLatency: Number(stats.avgLatency) || 0,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        cacheHitRate: 0, // TODO: Calculate from cache stats
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get system stats');
      throw error;
    }
  }

  /**
   * Get all providers
   */
  async getProviders(): Promise<ProviderManagement[]> {
    try {
      const allProviders = await db.select().from(providers);

      const providersWithMetrics = await Promise.all(
        allProviders.map(async (provider) => {
          const metrics = await db
            .select({
              totalRequests: count(),
              successCount: sql<number>`COUNT(CASE WHEN ${requests.status} = 'success' THEN 1 END)`,
              avgLatency: sql<number>`COALESCE(AVG(${requests.latencyMs}), 0)`,
            })
            .from(requests)
            .where(eq(requests.providerId, provider.id));

          const stats = metrics[0];
          const totalReqs = Number(stats.totalRequests) || 0;
          const successCount = Number(stats.successCount) || 0;

          const pricing = provider.pricing as { inputTokenPrice?: number; outputTokenPrice?: number } | null;
          return {
            id: provider.id,
            name: provider.name,
            displayName: provider.displayName,
            type: provider.name as any, // Use name as type since type column doesn't exist
            isActive: provider.isActive,
            config: provider.config as Record<string, any>,
            pricing: {
              inputTokenPrice: pricing?.inputTokenPrice || 0,
              outputTokenPrice: pricing?.outputTokenPrice || 0,
            },
            metrics: {
              totalRequests: totalReqs,
              successRate: totalReqs > 0 ? (successCount / totalReqs) * 100 : 0,
              averageLatency: Number(stats.avgLatency) || 0,
            },
          } as ProviderManagement;
        })
      );

      return providersWithMetrics;
    } catch (error) {
      logger.error({ error }, 'Failed to get providers');
      throw error;
    }
  }

  /**
   * Update provider
   */
  async updateProvider(
    providerId: string,
    data: Partial<ProviderManagement>
  ): Promise<void> {
    try {
      const updateData: any = {
        displayName: data.displayName,
        isActive: data.isActive,
        config: data.config,
      };
      
      // Update pricing if provided
      if (data.pricing) {
        updateData.pricing = data.pricing;
      }
      
      await db
        .update(providers)
        .set(updateData)
        .where(eq(providers.id, providerId));

      logger.info({ providerId, changes: data }, 'Provider updated');
    } catch (error) {
      logger.error({ error, providerId }, 'Failed to update provider');
      throw error;
    }
  }
}

