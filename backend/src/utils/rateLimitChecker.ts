/**
 * Rate Limit Checker
 * Check and enforce rate limits for users/organizations
 */

import { db } from '../db/index.js'
import { sql } from 'drizzle-orm'
import { getRedisClient } from './redis.js'
import { logger } from './logger.js'

const redis = getRedisClient()

interface RateLimitConfig {
  requestsPerMinute?: number
  requestsPerHour?: number
  requestsPerDay?: number
  tokensPerMinute?: number
  tokensPerHour?: number
  tokensPerDay?: number
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

export class RateLimitChecker {
  /**
   * Check if request is within rate limits
   */
  async checkRateLimit(
    orgId: string,
    userId: string,
    tokens: number = 0
  ): Promise<RateLimitResult> {
    try {
      // Get rate limit config from database or use defaults
      const config = await this.getRateLimitConfig(orgId)

      // Check requests per minute
      if (config.requestsPerMinute) {
        const requestsResult = await this.checkLimit(
          `ratelimit:requests:minute:${orgId}`,
          config.requestsPerMinute,
          60
        )
        
        if (!requestsResult.allowed) {
          return requestsResult
        }
      }

      // Check requests per hour
      if (config.requestsPerHour) {
        const requestsResult = await this.checkLimit(
          `ratelimit:requests:hour:${orgId}`,
          config.requestsPerHour,
          3600
        )
        
        if (!requestsResult.allowed) {
          return requestsResult
        }
      }

      // Check tokens per minute (if tokens are tracked)
      if (tokens > 0 && config.tokensPerMinute) {
        const tokensResult = await this.checkLimit(
          `ratelimit:tokens:minute:${orgId}`,
          config.tokensPerMinute,
          60,
          tokens
        )
        
        if (!tokensResult.allowed) {
          return tokensResult
        }
      }

      // All checks passed
      return {
        allowed: true,
        limit: config.requestsPerMinute || 100,
        remaining: config.requestsPerMinute || 100,
        resetAt: new Date(Date.now() + 60000),
      }
    } catch (error) {
      logger.error({ error, orgId, userId }, 'Rate limit check failed')
      // On error, allow the request (fail open)
      return {
        allowed: true,
        limit: 100,
        remaining: 100,
        resetAt: new Date(Date.now() + 60000),
      }
    }
  }

  /**
   * Check a specific limit using Redis
   */
  private async checkLimit(
    key: string,
    limit: number,
    windowSeconds: number,
    increment: number = 1
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000

    try {
      // Use Redis sorted set for sliding window
      await redis.zRemRangeByScore(key, 0, windowStart)
      
      const current = await redis.zCard(key)
      
      if (current >= limit) {
        const oldestTimestamp = await redis.zRange(key, 0, 0)
        const resetAt = new Date(parseInt(String(oldestTimestamp[0]) || '0') + windowSeconds * 1000)
        
        return {
          allowed: false,
          limit,
          remaining: 0,
          resetAt,
          retryAfter: Math.ceil((resetAt.getTime() - now) / 1000),
        }
      }

      // Add current request
      for (let i = 0; i < increment; i++) {
        await redis.zAdd(key, { score: now + i, value: `${now}-${i}` })
      }
      
      await redis.expire(key, windowSeconds)

      return {
        allowed: true,
        limit,
        remaining: limit - current - increment,
        resetAt: new Date(now + windowSeconds * 1000),
      }
    } catch (error) {
      logger.error({ error, key }, 'Redis rate limit check failed')
      // On Redis error, allow the request
      return {
        allowed: true,
        limit,
        remaining: limit,
        resetAt: new Date(now + windowSeconds * 1000),
      }
    }
  }

  /**
   * Get rate limit configuration for organization
   */
  private async getRateLimitConfig(orgId: string): Promise<RateLimitConfig> {
    try {
      // Try to get from cache first
      const cacheKey = `ratelimit:config:${orgId}`
      const cached = await redis.get(cacheKey)
      
      if (cached) {
        return JSON.parse(cached)
      }

      // Query database
      const result = await db.execute(sql`
        SELECT 
          requests_per_minute,
          requests_per_hour,
          requests_per_day,
          tokens_per_minute,
          tokens_per_hour,
          tokens_per_day
        FROM rate_limits
        WHERE org_id = ${orgId}
        LIMIT 1
      `)

      let config: RateLimitConfig
      const rows = result as any[]
      
      if (rows && rows.length > 0) {
        const row = rows[0] as any
        config = {
          requestsPerMinute: row.requests_per_minute,
          requestsPerHour: row.requests_per_hour,
          requestsPerDay: row.requests_per_day,
          tokensPerMinute: row.tokens_per_minute,
          tokensPerHour: row.tokens_per_hour,
          tokensPerDay: row.tokens_per_day,
        }
      } else {
        // Default limits
        config = {
          requestsPerMinute: 100,
          requestsPerHour: 5000,
          requestsPerDay: 100000,
        }
      }

      // Cache for 5 minutes
      await redis.setEx(cacheKey, 300, JSON.stringify(config))

      return config
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to get rate limit config')
      // Return default limits on error
      return {
        requestsPerMinute: 100,
        requestsPerHour: 5000,
        requestsPerDay: 100000,
      }
    }
  }

  /**
   * Reset rate limit for an organization (admin function)
   */
  async resetRateLimit(orgId: string): Promise<void> {
    try {
      const keys = [
        `ratelimit:requests:minute:${orgId}`,
        `ratelimit:requests:hour:${orgId}`,
        `ratelimit:requests:day:${orgId}`,
        `ratelimit:tokens:minute:${orgId}`,
        `ratelimit:tokens:hour:${orgId}`,
        `ratelimit:tokens:day:${orgId}`,
        `ratelimit:config:${orgId}`,
      ]

      for (const key of keys) {
        await redis.del(key)
      }

      logger.info({ orgId }, 'Rate limit reset')
    } catch (error) {
      logger.error({ error, orgId }, 'Failed to reset rate limit')
      throw error
    }
  }
}

export const rateLimitChecker = new RateLimitChecker()

