/**
 * Rate Limit Service
 * Advanced rate limiting per user/organization
 */

import { logger } from '../../utils/logger.js';
import { getRedisClient } from '../../utils/redis.js';
import { RateLimitConfig } from './types.js';

export class RateLimitService {
  private configs: Map<string, RateLimitConfig> = new Map();
  private redis = getRedisClient();

  /**
   * Set rate limit config for user or org
   */
  setConfig(config: RateLimitConfig): void {
    const key = config.userId || config.orgId;
    if (!key) {
      throw new Error('Either userId or orgId must be provided');
    }
    
    this.configs.set(key, config);
    logger.info({ config }, 'Rate limit config set');
  }

  /**
   * Get rate limit config
   */
  getConfig(userId?: string, orgId?: string): RateLimitConfig | null {
    // Try user-specific config first
    if (userId && this.configs.has(userId)) {
      return this.configs.get(userId)!;
    }
    
    // Fall back to org config
    if (orgId && this.configs.has(orgId)) {
      return this.configs.get(orgId)!;
    }
    
    return null;
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(
    userId: string,
    orgId: string,
    tokens?: number
  ): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    try {
      const config = this.getConfig(userId, orgId);
      
      if (!config || !config.enabled) {
        return { allowed: true };
      }

      const now = Date.now();
      const identifier = userId || orgId;

      // Check per-minute limit
      const minuteKey = `ratelimit:${identifier}:minute:${Math.floor(now / 60000)}`;
      const minuteCount = await this.redis.incr(minuteKey);
      await this.redis.expire(minuteKey, 60);

      if (minuteCount > config.requestsPerMinute) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded: requests per minute',
          retryAfter: 60 - (Math.floor(now / 1000) % 60),
        };
      }

      // Check per-hour limit
      const hourKey = `ratelimit:${identifier}:hour:${Math.floor(now / 3600000)}`;
      const hourCount = await this.redis.incr(hourKey);
      await this.redis.expire(hourKey, 3600);

      if (hourCount > config.requestsPerHour) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded: requests per hour',
          retryAfter: 3600 - (Math.floor(now / 1000) % 3600),
        };
      }

      // Check per-day limit
      const dayKey = `ratelimit:${identifier}:day:${Math.floor(now / 86400000)}`;
      const dayCount = await this.redis.incr(dayKey);
      await this.redis.expire(dayKey, 86400);

      if (dayCount > config.requestsPerDay) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded: requests per day',
          retryAfter: 86400 - (Math.floor(now / 1000) % 86400),
        };
      }

      // Check token limits if provided
      if (tokens && config.tokensPerMinute) {
        const tokenMinuteKey = `ratelimit:${identifier}:tokens:minute:${Math.floor(now / 60000)}`;
        const tokenMinuteCount = await this.redis.incrBy(tokenMinuteKey, tokens);
        await this.redis.expire(tokenMinuteKey, 60);

        if (tokenMinuteCount > config.tokensPerMinute) {
          return {
            allowed: false,
            reason: 'Rate limit exceeded: tokens per minute',
            retryAfter: 60 - (Math.floor(now / 1000) % 60),
          };
        }
      }

      if (tokens && config.tokensPerDay) {
        const tokenDayKey = `ratelimit:${identifier}:tokens:day:${Math.floor(now / 86400000)}`;
        const tokenDayCount = await this.redis.incrBy(tokenDayKey, tokens);
        await this.redis.expire(tokenDayKey, 86400);

        if (tokenDayCount > config.tokensPerDay) {
          return {
            allowed: false,
            reason: 'Rate limit exceeded: tokens per day',
            retryAfter: 86400 - (Math.floor(now / 1000) % 86400),
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error({ error, userId, orgId }, 'Failed to check rate limit');
      // Fail open - allow request if rate limit check fails
      return { allowed: true };
    }
  }

  /**
   * Get current usage
   */
  async getUsage(userId: string, orgId: string): Promise<{
    requestsThisMinute: number;
    requestsThisHour: number;
    requestsThisDay: number;
    tokensThisMinute?: number;
    tokensThisDay?: number;
  }> {
    try {
      const now = Date.now();
      const identifier = userId || orgId;

      const [
        requestsThisMinute,
        requestsThisHour,
        requestsThisDay,
        tokensThisMinute,
        tokensThisDay,
      ] = await Promise.all([
        this.redis.get(`ratelimit:${identifier}:minute:${Math.floor(now / 60000)}`),
        this.redis.get(`ratelimit:${identifier}:hour:${Math.floor(now / 3600000)}`),
        this.redis.get(`ratelimit:${identifier}:day:${Math.floor(now / 86400000)}`),
        this.redis.get(`ratelimit:${identifier}:tokens:minute:${Math.floor(now / 60000)}`),
        this.redis.get(`ratelimit:${identifier}:tokens:day:${Math.floor(now / 86400000)}`),
      ]);

      return {
        requestsThisMinute: parseInt(requestsThisMinute || '0'),
        requestsThisHour: parseInt(requestsThisHour || '0'),
        requestsThisDay: parseInt(requestsThisDay || '0'),
        tokensThisMinute: tokensThisMinute ? parseInt(tokensThisMinute) : undefined,
        tokensThisDay: tokensThisDay ? parseInt(tokensThisDay) : undefined,
      };
    } catch (error) {
      logger.error({ error, userId, orgId }, 'Failed to get usage');
      throw error;
    }
  }

  /**
   * Reset limits for a user/org
   */
  async resetLimits(userId?: string, orgId?: string): Promise<void> {
    try {
      const identifier = userId || orgId;
      if (!identifier) {
        throw new Error('Either userId or orgId must be provided');
      }

      const now = Date.now();
      const keys = [
        `ratelimit:${identifier}:minute:*`,
        `ratelimit:${identifier}:hour:*`,
        `ratelimit:${identifier}:day:*`,
        `ratelimit:${identifier}:tokens:*`,
      ];

      // Delete all rate limit keys
      for (const pattern of keys) {
        const keysToDelete = await this.redis.keys(pattern);
        if (keysToDelete.length > 0) {
          await this.redis.del(keysToDelete);
        }
      }

      logger.info({ userId, orgId }, 'Rate limits reset');
    } catch (error) {
      logger.error({ error, userId, orgId }, 'Failed to reset limits');
      throw error;
    }
  }

  /**
   * Remove rate limit config
   */
  removeConfig(userId?: string, orgId?: string): void {
    const key = userId || orgId;
    if (key) {
      this.configs.delete(key);
      logger.info({ userId, orgId }, 'Rate limit config removed');
    }
  }

  /**
   * Get all configs
   */
  getAllConfigs(): RateLimitConfig[] {
    return Array.from(this.configs.values());
  }
}

// Singleton instance
export const rateLimitService = new RateLimitService();

