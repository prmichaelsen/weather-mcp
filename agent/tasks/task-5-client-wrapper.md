# Task 5: Create OpenWeatherMap Client Wrapper

**Milestone**: Milestone 1 (Project Foundation)
**Estimated Time**: 3 hours
**Dependencies**: Task 4
**Status**: Not Started

---

## Objective

Create a TypeScript client wrapper for the OpenWeatherMap One Call API 3.0 with proper error handling, request validation, and response caching.

## Steps

1. Create `src/client.ts`:
   - WeatherClient class
   - Constructor accepts API key
   - Base URL configuration
   - Request timeout handling

2. Implement API methods:
   - `getCurrentAndForecast()` - Current weather + forecasts
   - `getHistorical()` - Historical weather data
   - `getDaySummary()` - Daily aggregated statistics
   - `getOverview()` - AI-generated weather summary
   - `geocode()` - Location name to coordinates
   - `reverseGeocode()` - Coordinates to location name

3. Add request validation:
   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - Date format: YYYY-MM-DD
   - Units: standard, metric, imperial

4. Implement error handling:
   - 401 Unauthorized (invalid API key)
   - 404 Not Found (invalid coordinates)
   - 429 Too Many Requests (rate limit)
   - 500 Server Error (OpenWeatherMap issues)
   - Network errors with retry logic

5. Add response caching:
   - Cache interface
   - TTL-based expiration
   - Cache key generation
   - Cache hit/miss logging

6. Create TypeScript types in `src/types.ts`:
   - CurrentWeatherResponse
   - HourlyForecastResponse
   - DailyForecastResponse
   - WeatherAlert
   - GeocodingResult
   - All API response types

7. Add unit tests (optional for this task):
   - Mock API responses
   - Test error handling
   - Test validation logic

## Verification

- [ ] src/client.ts created
- [ ] WeatherClient class implemented
- [ ] All 6 API methods implemented
- [ ] Input validation works correctly
- [ ] Error handling comprehensive
- [ ] Response caching implemented
- [ ] src/types.ts with all type definitions
- [ ] TypeScript compiles without errors
- [ ] Client can be instantiated with API key
- [ ] Methods return properly typed responses

## Files to Create

- `src/client.ts`
- `src/types.ts`
- `src/utils/cache.ts`

## API Methods Specification

### getCurrentAndForecast
```typescript
async getCurrentAndForecast(
  lat: number,
  lon: number,
  options?: {
    exclude?: ('current' | 'minutely' | 'hourly' | 'daily' | 'alerts')[];
    units?: 'standard' | 'metric' | 'imperial';
    lang?: string;
  }
): Promise<CurrentAndForecastResponse>
```

### getHistorical
```typescript
async getHistorical(
  lat: number,
  lon: number,
  timestamp: number,
  options?: {
    units?: 'standard' | 'metric' | 'imperial';
  }
): Promise<HistoricalResponse>
```

### getDaySummary
```typescript
async getDaySummary(
  lat: number,
  lon: number,
  date: string, // YYYY-MM-DD
  options?: {
    units?: 'standard' | 'metric' | 'imperial';
    tz?: string;
  }
): Promise<DaySummaryResponse>
```

### getOverview
```typescript
async getOverview(
  lat: number,
  lon: number,
  options?: {
    date?: string; // YYYY-MM-DD
    units?: 'standard' | 'metric' | 'imperial';
  }
): Promise<OverviewResponse>
```

### geocode
```typescript
async geocode(
  city: string,
  options?: {
    state?: string;
    country?: string;
    limit?: number;
  }
): Promise<GeocodingResult[]>
```

## Notes

- Use fetch API for HTTP requests
- Implement exponential backoff for retries
- Cache responses to reduce API calls
- Validate all inputs before making requests
- Provide clear error messages
- Follow OpenWeatherMap API documentation exactly
- Use TypeScript for type safety

---

**Previous Task**: [Task 4: Configure Build System](task-4-build-system.md)
**Next Task**: [Task 6: Create Environment Configuration](task-6-environment.md)
