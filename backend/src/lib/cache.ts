/**
 * Simple LRU Cache with TTL support for server-side caching
 * Optimizes performance by reducing database queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class LRUCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize = 100;

  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  /**
   * Set cache value with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Remove oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Singleton instance
export const cache = new LRUCache();

/**
 * Helper to create cache headers for HTTP responses
 * Usage: response.headers.set('Cache-Control', getCacheControl('analytics', 300))
 */
export function getCacheControl(type: 'analytics' | 'assets' | 'dashboard' | 'users' | 'readonly', maxAgeSeconds: number = 300): string {
  // Public caches (CDN, proxy) can cache read-only data
  // Private caches (browser) can cache most data
  // no-store for sensitive data, no-cache for validation

  switch (type) {
    case 'readonly':
      // Long cache for static, rarely-changing data
      return `public, max-age=${maxAgeSeconds || 3600}, s-maxage=${maxAgeSeconds || 3600}`;
    case 'analytics':
      // Medium cache for analytics (5 min default)
      return `private, max-age=${maxAgeSeconds || 300}, must-revalidate`;
    case 'assets':
      // Short cache for asset lists (30 sec default)
      return `private, max-age=${maxAgeSeconds || 30}, must-revalidate`;
    case 'dashboard':
      // Very short cache for dashboard (1 min default)
      return `private, max-age=${maxAgeSeconds || 60}, must-revalidate`;
    case 'users':
      // Don't cache user data by default
      return 'private, no-cache, no-store, must-revalidate';
    default:
      return `private, max-age=${maxAgeSeconds || 300}, must-revalidate`;
  }
}

/**
 * Decorator for caching function results
 */
export function Cacheable(ttlMs: number = 5 * 60 * 1000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttlMs);
      return result;
    };

    return descriptor;
  };
}
