interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  keys: string[];
  memoryUsage: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
}

export class CacheManager {
  private cache = new Map<string, CacheItem<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 1000;
  private totalHits = 0;
  private totalMisses = 0;

  constructor(options?: {
    defaultTTL?: number;
    maxSize?: number;
  }) {
    if (options?.defaultTTL) {
      this.defaultTTL = options.defaultTTL;
    }
    if (options?.maxSize) {
      this.maxSize = options.maxSize;
    }

    // Clean up expired items every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      lastAccessed: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.totalMisses++;
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.totalMisses++;
      return null;
    }

    // Update access stats
    item.hits++;
    item.lastAccessed = Date.now();
    this.totalHits++;

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }

  // Cache with automatic invalidation
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  // Pattern-based invalidation
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidate by prefix
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Update TTL for existing key
  updateTTL(key: string, newTTL: number): boolean {
    const item = this.cache.get(key);
    if (item) {
      item.ttl = newTTL;
      return true;
    }
    return false;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Evict least recently used item
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats(): CacheStats {
    const keys = Array.from(this.cache.keys());
    const memoryUsage = JSON.stringify(Array.from(this.cache.values())).length;
    const hitRate = this.totalHits + this.totalMisses > 0 
      ? this.totalHits / (this.totalHits + this.totalMisses) 
      : 0;

    return {
      size: this.cache.size,
      keys,
      memoryUsage,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
    };
  }

  // Export cache data (for debugging)
  export(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() - item.timestamp <= item.ttl) {
        data[key] = item.data;
      }
    }
    return data;
  }

  // Import cache data (for debugging)
  import(data: Record<string, unknown>, ttl?: number): void {
    for (const [key, value] of Object.entries(data)) {
      this.set(key, value, ttl);
    }
  }
}

// Create singleton instances for different cache types
export const cache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
});

export const shortTermCache = new CacheManager({
  defaultTTL: 1 * 60 * 1000, // 1 minute
  maxSize: 500,
});

export const longTermCache = new CacheManager({
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
});

// Cache keys constants
export const CACHE_KEYS = {
  // Projects
  PROJECTS: 'projects',
  PROJECT: (id: string) => `project:${id}`,
  
  // Keywords
  KEYWORDS: (projectId: string) => `keywords:${projectId}`,
  KEYWORD: (id: string) => `keyword:${id}`,
  
  // Analytics
  ANALYTICS: (projectId: string) => `analytics:${projectId}`,
  ANALYTICS_SUMMARY: (projectId: string) => `analytics:summary:${projectId}`,
  
  // Competitors
  COMPETITORS: (projectId: string) => `competitors:${projectId}`,
  COMPETITOR_ANALYSIS: (projectId: string, competitorId: string) => 
    `competitor:analysis:${projectId}:${competitorId}`,
  
  // Backlinks
  BACKLINKS: (projectId: string) => `backlinks:${projectId}`,
  BACKLINK_ANALYSIS: (projectId: string) => `backlinks:analysis:${projectId}`,
  
  // SERP Data
  SERP_DATA: (keyword: string, location: string) => `serp:${keyword}:${location}`,
  SERP_FEATURES: (keyword: string) => `serp:features:${keyword}`,
  
  // AI Analysis
  AI_ANALYSIS: (contentHash: string) => `ai:analysis:${contentHash}`,
  AI_RECOMMENDATIONS: (projectId: string) => `ai:recommendations:${projectId}`,
  
  // User data
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_SETTINGS: (userId: string) => `user:settings:${userId}`,
  
  // API responses
  DATAFORSEO: (endpoint: string, params: string) => `dataforseo:${endpoint}:${params}`,
  GSC_DATA: (siteUrl: string, dateRange: string) => `gsc:${siteUrl}:${dateRange}`,
  GA4_DATA: (propertyId: string, dateRange: string) => `ga4:${propertyId}:${dateRange}`,
} as const;

// Cache utility functions
export const cacheUtils = {
  // Generate cache key with parameters
  generateKey: (prefix: string, ...params: (string | number)[]): string => {
    return `${prefix}:${params.join(':')}`;
  },

  // Cache with automatic refresh
  withRefresh: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    refreshThreshold?: number
  ): Promise<T> => {
    const item = cache['cache'].get(key);
    const refreshThresholdMs = (refreshThreshold || 0.8) * (ttl || cache['defaultTTL']);
    
    // If item is close to expiring, refresh in background
    if (item && Date.now() - item.timestamp > refreshThresholdMs) {
      // Return cached data immediately
      const cachedData = cache.get<T>(key);
      if (cachedData) {
        // Refresh in background
        fetcher().then(data => {
          cache.set(key, data, ttl);
        }).catch(console.error);
        return cachedData;
      }
    }
    
    return cache.getOrSet(key, fetcher, ttl);
  },

  // Batch cache operations
  batchGet: <T>(keys: string[]): Record<string, T | null> => {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = cache.get<T>(key);
    }
    return result;
  },

  batchSet: <T>(items: Record<string, T>, ttl?: number): void => {
    for (const [key, value] of Object.entries(items)) {
      cache.set(key, value, ttl);
    }
  },

  batchDelete: (keys: string[]): void => {
    for (const key of keys) {
      cache.delete(key);
    }
  },
};
