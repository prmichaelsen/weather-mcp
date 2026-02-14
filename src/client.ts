/**
 * OpenWeatherMap API client wrapper
 * Handles all API interactions with caching and error handling
 */

import { Cache } from './utils/cache.js';
import { logger } from './utils/logger.js';
import {
  WeatherAPIError,
  ValidationError,
  RateLimitError,
} from './types.js';
import type {
  ClientConfig,
  CurrentAndForecastResponse,
  HistoricalResponse,
  DaySummaryResponse,
  OverviewResponse,
  GeocodingResult,
  ForecastOptions,
  HistoricalOptions,
  DaySummaryOptions,
  OverviewOptions,
  GeocodeOptions,
  Units,
} from './types.js';

export class WeatherClient {
  private apiKey: string;
  private baseUrl: string;
  private geoUrl: string;
  private timeout: number;
  private cache: Cache<any>;
  private cacheTtl: {
    current: number;
    hourly: number;
    daily: number;
    alerts: number;
    geocode: number;
  };

  constructor(apiKey: string, options?: Partial<ClientConfig>) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl || 'https://api.openweathermap.org/data/3.0/onecall';
    this.geoUrl = options?.geoUrl || 'https://api.openweathermap.org/geo/1.0';
    this.timeout = options?.timeout || 30000;
    this.cache = new Cache(options?.maxCacheSize || 1000);
    this.cacheTtl = {
      current: options?.cacheTtl?.current || 600,      // 10 minutes
      hourly: options?.cacheTtl?.hourly || 1800,       // 30 minutes
      daily: options?.cacheTtl?.daily || 3600,         // 1 hour
      alerts: options?.cacheTtl?.alerts || 300,        // 5 minutes
      geocode: options?.cacheTtl?.geocode || 86400,    // 24 hours
    };
  }

  /**
   * Get current weather and forecasts
   */
  async getCurrentAndForecast(
    lat: number,
    lon: number,
    options?: ForecastOptions
  ): Promise<CurrentAndForecastResponse> {
    this.validateCoordinates(lat, lon);
    if (options?.units) {
      this.validateUnits(options.units);
    }

    const cacheKey = `forecast:${lat}:${lon}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit for forecast', { lat, lon });
      return cached;
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.apiKey,
    });

    if (options?.exclude && options.exclude.length > 0) {
      params.append('exclude', options.exclude.join(','));
    }
    if (options?.units) {
      params.append('units', options.units);
    }
    if (options?.lang) {
      params.append('lang', options.lang);
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await this.makeRequest<CurrentAndForecastResponse>(url);

    this.cache.set(cacheKey, response, this.cacheTtl.current);
    return response;
  }

  /**
   * Get historical weather data
   */
  async getHistorical(
    lat: number,
    lon: number,
    timestamp: number,
    options?: HistoricalOptions
  ): Promise<HistoricalResponse> {
    this.validateCoordinates(lat, lon);
    if (options?.units) {
      this.validateUnits(options.units);
    }

    if (timestamp <= 0) {
      throw new ValidationError('Timestamp must be a positive number', 'timestamp');
    }

    const cacheKey = `historical:${lat}:${lon}:${timestamp}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit for historical', { lat, lon, timestamp });
      return cached;
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      dt: timestamp.toString(),
      appid: this.apiKey,
    });

    if (options?.units) {
      params.append('units', options.units);
    }

    const url = `${this.baseUrl}/timemachine?${params.toString()}`;
    const response = await this.makeRequest<HistoricalResponse>(url);

    // Cache historical data for 24 hours (it doesn't change)
    this.cache.set(cacheKey, response, 86400);
    return response;
  }

  /**
   * Get daily weather summary
   */
  async getDaySummary(
    lat: number,
    lon: number,
    date: string,
    options?: DaySummaryOptions
  ): Promise<DaySummaryResponse> {
    this.validateCoordinates(lat, lon);
    this.validateDate(date);
    if (options?.units) {
      this.validateUnits(options.units);
    }

    const cacheKey = `day_summary:${lat}:${lon}:${date}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit for day summary', { lat, lon, date });
      return cached;
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      date: date,
      appid: this.apiKey,
    });

    if (options?.units) {
      params.append('units', options.units);
    }
    if (options?.tz) {
      params.append('tz', options.tz);
    }

    const url = `${this.baseUrl}/day_summary?${params.toString()}`;
    const response = await this.makeRequest<DaySummaryResponse>(url);

    // Cache day summary for 24 hours
    this.cache.set(cacheKey, response, 86400);
    return response;
  }

  /**
   * Get AI-generated weather overview
   */
  async getOverview(
    lat: number,
    lon: number,
    options?: OverviewOptions
  ): Promise<OverviewResponse> {
    this.validateCoordinates(lat, lon);
    if (options?.date) {
      this.validateDate(options.date);
    }
    if (options?.units) {
      this.validateUnits(options.units);
    }

    const cacheKey = `overview:${lat}:${lon}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit for overview', { lat, lon });
      return cached;
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.apiKey,
    });

    if (options?.date) {
      params.append('date', options.date);
    }
    if (options?.units) {
      params.append('units', options.units);
    }

    const url = `${this.baseUrl}/overview?${params.toString()}`;
    const response = await this.makeRequest<OverviewResponse>(url);

    // Cache overview for 1 hour
    this.cache.set(cacheKey, response, 3600);
    return response;
  }

  /**
   * Geocode location name to coordinates
   */
  async geocode(
    city: string,
    options?: GeocodeOptions
  ): Promise<GeocodingResult[]> {
    if (!city || city.trim().length === 0) {
      throw new ValidationError('City name is required', 'city');
    }

    const cacheKey = `geocode:${city}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit for geocode', { city });
      return cached;
    }

    let query = city.trim();
    if (options?.state) {
      query += `,${options.state}`;
    }
    if (options?.country) {
      query += `,${options.country}`;
    }

    const params = new URLSearchParams({
      q: query,
      appid: this.apiKey,
    });

    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }

    const url = `${this.geoUrl}/direct?${params.toString()}`;
    const response = await this.makeRequest<GeocodingResult[]>(url);

    // Cache geocoding for 24 hours
    this.cache.set(cacheKey, response, this.cacheTtl.geocode);
    return response;
  }

  /**
   * Reverse geocode coordinates to location name
   */
  async reverseGeocode(
    lat: number,
    lon: number,
    limit: number = 1
  ): Promise<GeocodingResult[]> {
    this.validateCoordinates(lat, lon);

    const cacheKey = `reverse_geocode:${lat}:${lon}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit for reverse geocode', { lat, lon });
      return cached;
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      limit: limit.toString(),
      appid: this.apiKey,
    });

    const url = `${this.geoUrl}/reverse?${params.toString()}`;
    const response = await this.makeRequest<GeocodingResult[]>(url);

    // Cache reverse geocoding for 24 hours
    this.cache.set(cacheKey, response, this.cacheTtl.geocode);
    return response;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): void {
    this.cache.cleanup();
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Make HTTP request with error handling and retries
   */
  private async makeRequest<T>(url: string, retries: number = 3): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on validation errors or 4xx errors
        if (error instanceof ValidationError || 
            (error instanceof WeatherAPIError && error.statusCode && error.statusCode < 500)) {
          throw error;
        }

        // Exponential backoff for retries
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.warn(`Request failed, retrying in ${delay}ms`, { attempt, error });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Handle error responses from API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const message = errorData.message || `HTTP ${statusCode}: ${response.statusText}`;

    switch (statusCode) {
      case 401:
        throw new WeatherAPIError('Invalid API key', 401, 'UNAUTHORIZED', errorData);
      case 404:
        throw new WeatherAPIError('Resource not found - check coordinates or parameters', 404, 'NOT_FOUND', errorData);
      case 429:
        throw new RateLimitError(message);
      case 500:
      case 502:
      case 503:
        throw new WeatherAPIError(`OpenWeatherMap service error: ${message}`, statusCode, 'SERVICE_ERROR', errorData);
      default:
        throw new WeatherAPIError(message, statusCode, 'API_ERROR', errorData);
    }
  }

  /**
   * Validate latitude and longitude
   */
  private validateCoordinates(lat: number, lon: number): void {
    if (typeof lat !== 'number' || isNaN(lat)) {
      throw new ValidationError('Latitude must be a number', 'lat');
    }
    if (typeof lon !== 'number' || isNaN(lon)) {
      throw new ValidationError('Longitude must be a number', 'lon');
    }
    if (lat < -90 || lat > 90) {
      throw new ValidationError('Latitude must be between -90 and 90', 'lat');
    }
    if (lon < -180 || lon > 180) {
      throw new ValidationError('Longitude must be between -180 and 180', 'lon');
    }
  }

  /**
   * Validate units parameter
   */
  private validateUnits(units: Units): void {
    const validUnits: Units[] = ['standard', 'metric', 'imperial'];
    if (!validUnits.includes(units)) {
      throw new ValidationError(
        `Units must be one of: ${validUnits.join(', ')}`,
        'units'
      );
    }
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private validateDate(date: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new ValidationError(
        'Date must be in YYYY-MM-DD format',
        'date'
      );
    }

    // Check if date is valid
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError('Invalid date', 'date');
    }
  }
}
