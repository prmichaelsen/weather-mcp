# Task 11: Add Response Caching

**Milestone**: Milestone 2 (Core Implementation)
**Estimated Time**: 2 hours
**Dependencies**: Task 10
**Status**: Not Started

---

## Objective

Implement response caching in the WeatherClient to reduce API calls, improve performance, and stay within OpenWeatherMap rate limits.

## Steps

1. Create `src/utils/cache.ts`:
   - Cache interface
   - In-memory cache implementation
   - TTL-based expiration
   - Cache key generation
   - Cache statistics (hits/misses)

2. Implement cache in WeatherClient:
   - Add cache instance to client
   - Cache key format: `{method}:{lat}:{lon}:{options}`
   - Check cache before API calls
   - Store responses in cache
   - Respect TTL settings

3. Configure cache TTL by endpoint:
   - Current weather: 10 minutes (600s)
   - Hourly forecast: 30 minutes (1800s)
   - Daily forecast: 1 hour (3600s)
   - Alerts: 5 minutes (300s)
   - Geocoding: 24 hours (86400s)

4. Add cache management:
   - Clear expired entries
   - Manual cache clear method
   - Cache size limits
   - Memory management

5. Add cache statistics:
   - Track hits and misses
   - Log cache performance
   - Expose stats method

6. Add configuration:
   - Enable/disable caching
   - Configure TTL per endpoint
   - Configure max cache size
   - Environment variables

7. Add tests (optional):
   - Cache hit/miss behavior
   - TTL expiration
   - Cache key generation
   - Memory limits

## Verification

- [ ] src/utils/cache.ts created
- [ ] Cache interface defined
- [ ] In-memory cache implemented
- [ ] TTL expiration works
- [ ] Cache integrated in WeatherClient
- [ ] Cache keys generated correctly
- [ ] Different TTLs per endpoint
- [ ] Cache statistics tracked
- [ ] Configuration via environment
- [ ] Memory management implemented

## Files to Create

- `src/utils/cache.ts`

## Cache Implementation

```typescript
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Set value in cache with TTL
   */
  set(key: string, value: T, ttlSeconds: number): void {
    // Enforce size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }
}
```

## WeatherClient Integration

```typescript
export class WeatherClient {
  private apiKey: string;
  private baseUrl: string;
  private cache: Cache<any>;
  private cacheTtl: {
    current: number;
    hourly: number;
    daily: number;
    alerts: number;
    geocode: number;
  };

  constructor(apiKey: string, options?: ClientOptions) {
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl || 'https://api.openweathermap.org/data/3.0';
    this.cache = new Cache(options?.maxCacheSize || 1000);
    this.cacheTtl = {
      current: options?.cacheTtl?.current || 600,
      hourly: options?.cacheTtl?.hourly || 1800,
      daily: options?.cacheTtl?.daily || 3600,
      alerts: options?.cacheTtl?.alerts || 300,
      geocode: options?.cacheTtl?.geocode || 86400,
    };
  }

  async getCurrentAndForecast(
    lat: number,
    lon: number,
    options?: ForecastOptions
  ): Promise<CurrentAndForecastResponse> {
    // Generate cache key
    const cacheKey = `forecast:${lat}:${lon}:${JSON.stringify(options)}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API call
    const response = await this.makeRequest(/* ... */);

    // Store in cache
    this.cache.set(cacheKey, response, this.cacheTtl.current);

    return response;
  }

  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

## Configuration

Add to `.env.example`:
```env
# Cache Configuration
CACHE_ENABLED=true
CACHE_MAX_SIZE=1000
CACHE_TTL_CURRENT=600
CACHE_TTL_HOURLY=1800
CACHE_TTL_DAILY=3600
CACHE_TTL_ALERTS=300
CACHE_TTL_GEOCODE=86400
```

## Notes

- Cache reduces API calls significantly
- Helps stay within rate limits
- Improves response time
- Different TTLs for different data types
- Memory-efficient with size limits
- Automatic cleanup of expired entries
- Statistics for monitoring

---

**Previous Task**: [Task 10: Implement Server Factory](task-10-server-factory.md)
**Next Task**: [Task 12: Add Logging and Error Handling](task-12-logging-errors.md)
