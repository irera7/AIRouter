/**
 * Cache Service using Redis
 * Provides caching for LLM responses to reduce costs and latency
 */

import { getRedisClient } from './redis';

const redis = getRedisClient();
import { logger } from './logger';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
  namespace?: string; // Cache namespace/prefix
}

export class CacheService {
  private defaultTTL = 3600; // 1 hour
  private defaultNamespace = 'airouter';

  /**
   * Generate cache key from request data
   */
  private generateKey(data: any, namespace?: string): string {
    const hash = createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    
    const ns = namespace || this.defaultNamespace;
    return `${ns}:${hash}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      
      if (!value) {
        return null;
      }

      logger.debug({ key }, 'Cache hit');
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ error, key }, 'Cache get error');
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    try {
      const ttl = options?.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);
      
      await redis.setEx(key, ttl, serialized);
      
      logger.debug({ key, ttl }, 'Cache set');
      return true;
    } catch (error) {
      logger.error({ error, key }, 'Cache set error');
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      logger.debug({ key }, 'Cache deleted');
      return true;
    } catch (error) {
      logger.error({ error, key }, 'Cache delete error');
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  async clear(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await redis.del(keys);
      logger.info({ pattern, count: keys.length }, 'Cache cleared');
      return keys.length;
    } catch (error) {
      logger.error({ error, pattern }, 'Cache clear error');
      return 0;
    }
  }

  /**
   * Get or set cached value (cache-aside pattern)
   */
  async getOrSet<T>(
    keyData: any,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<{ value: T; cached: boolean }> {
    const key = this.generateKey(keyData, options?.namespace);
    
    // Try to get from cache
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return { value: cached, cached: true };
    }

    // Cache miss - fetch and cache
    const value = await fetcher();
    await this.set(key, value, options);
    
    return { value, cached: false };
  }

  /**
   * Cache a chat completion response
   */
  async cacheResponse(
    request: any,
    response: any,
    ttl: number = 3600
  ): Promise<string> {
    const key = this.generateKey(request, 'chat');
    await this.set(key, response, { ttl, namespace: 'chat' });
    return key;
  }

  /**
   * Get cached chat completion response
   */
  async getCachedResponse(request: any): Promise<any | null> {
    const key = this.generateKey(request, 'chat');
    return this.get(key);
  }

  /**
   * Invalidate all chat caches
   */
  async invalidateChatCache(): Promise<number> {
    return this.clear('chat:*');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
  }> {
    try {
      const info = await redis.info('stats');
      const lines = info.split('\r\n');
      
      const stats: any = {};
      for (const line of lines) {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      }

      const keys = await redis.dbSize();

      return {
        keys,
        memory: stats.used_memory_human || 'N/A',
        hits: parseInt(stats.keyspace_hits || '0'),
        misses: parseInt(stats.keyspace_misses || '0'),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get cache stats');
      return {
        keys: 0,
        memory: 'N/A',
        hits: 0,
        misses: 0,
      };
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

