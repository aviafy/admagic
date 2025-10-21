import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { ModerationResult } from '../../../common/interfaces';
import { ContentType } from '../../../common/constants';

/**
 * Caching service for moderation results
 * Prevents duplicate AI API calls for identical content
 */
@Injectable()
export class ModerationCacheService {
  private readonly logger = new Logger(ModerationCacheService.name);
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'moderation:';

  // Statistics for monitoring
  private stats = {
    hits: 0,
    misses: 0,
    saves: 0,
  };

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Generate a unique cache key for content
   * Uses SHA-256 hash to ensure consistent key for identical content
   */
  private generateCacheKey(content: string, contentType: ContentType): string {
    const hash = createHash('sha256')
      .update(`${contentType}:${content}`)
      .digest('hex');
    return `${this.CACHE_PREFIX}${hash}`;
  }

  /**
   * Get cached moderation result
   * Returns null if not found in cache
   */
  async get(
    content: string,
    contentType: ContentType,
  ): Promise<ModerationResult | null> {
    const key = this.generateCacheKey(content, contentType);

    try {
      const cached = await this.cacheManager.get<ModerationResult>(key);

      if (cached) {
        this.stats.hits++;
        this.logger.debug(`Cache HIT for key: ${key.substring(0, 20)}...`);
        return cached;
      }

      this.stats.misses++;
      this.logger.debug(`Cache MISS for key: ${key.substring(0, 20)}...`);
      return null;
    } catch (error) {
      this.logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Store moderation result in cache
   */
  async set(
    content: string,
    contentType: ContentType,
    result: ModerationResult,
  ): Promise<void> {
    const key = this.generateCacheKey(content, contentType);

    try {
      await this.cacheManager.set(key, result, this.CACHE_TTL * 1000);
      this.stats.saves++;
      this.logger.debug(`Cached result for key: ${key.substring(0, 20)}...`);
    } catch (error) {
      this.logger.error('Cache set error:', error);
      // Don't throw - caching is not critical
    }
  }

  /**
   * Clear specific cache entry
   */
  async invalidate(content: string, contentType: ContentType): Promise<void> {
    const key = this.generateCacheKey(content, contentType);

    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Invalidated cache for key: ${key.substring(0, 20)}...`);
    } catch (error) {
      this.logger.error('Cache invalidation error:', error);
    }
  }

  /**
   * Clear all moderation caches
   * Note: cache-manager v6 doesn't have reset(), only individual delete
   */
  async clearAll(): Promise<void> {
    try {
      // cache-manager v6 doesn't support reset()
      // For production, consider using Redis with FLUSHDB
      this.logger.warn('Clear all not implemented for cache-manager v6');
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : '0.00';

    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Log cache statistics
   */
  logStats(): void {
    const stats = this.getStats();
    this.logger.log(
      `Cache Stats - Hits: ${stats.hits}, Misses: ${stats.misses}, ` +
      `Hit Rate: ${stats.hitRate}, Total Saves: ${stats.saves}`,
    );
  }
}
