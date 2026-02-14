/**
 * TypeScript type definitions for OpenWeatherMap One Call API 3.0
 */

// ============================================================================
// Common Types
// ============================================================================

export type Units = 'standard' | 'metric' | 'imperial';

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

// ============================================================================
// Current & Forecast Response Types
// ============================================================================

export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export interface MinutelyForecast {
  dt: number;
  precipitation: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  pop: number; // Probability of precipitation
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary?: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface CurrentAndForecastResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current?: CurrentWeather;
  minutely?: MinutelyForecast[];
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  alerts?: WeatherAlert[];
}

// ============================================================================
// Historical (Time Machine) Response Types
// ============================================================================

export interface HistoricalWeatherData {
  dt: number;
  sunrise?: number;
  sunset?: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherCondition[];
}

export interface HistoricalResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  data: HistoricalWeatherData[];
}

// ============================================================================
// Day Summary Response Types
// ============================================================================

export interface DaySummaryResponse {
  lat: number;
  lon: number;
  tz: string;
  date: string;
  units: string;
  cloud_cover?: {
    afternoon?: number;
  };
  humidity?: {
    afternoon?: number;
  };
  precipitation?: {
    total?: number;
  };
  temperature?: {
    min?: number;
    max?: number;
    afternoon?: number;
    night?: number;
    evening?: number;
    morning?: number;
  };
  pressure?: {
    afternoon?: number;
  };
  wind?: {
    max?: {
      speed?: number;
      direction?: number;
    };
  };
}

// ============================================================================
// Weather Overview Response Types
// ============================================================================

export interface OverviewResponse {
  lat: number;
  lon: number;
  tz: string;
  date: string;
  units: string;
  weather_overview: string;
}

// ============================================================================
// Geocoding Response Types
// ============================================================================

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class WeatherAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WeatherAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends WeatherAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Client Configuration Types
// ============================================================================

export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
  geoUrl?: string;
  timeout?: number;
  maxCacheSize?: number;
  cacheTtl?: {
    current?: number;
    hourly?: number;
    daily?: number;
    alerts?: number;
    geocode?: number;
  };
}

export interface ForecastOptions {
  exclude?: ('current' | 'minutely' | 'hourly' | 'daily' | 'alerts')[];
  units?: Units;
  lang?: string;
}

export interface HistoricalOptions {
  units?: Units;
}

export interface DaySummaryOptions {
  units?: Units;
  tz?: string;
}

export interface OverviewOptions {
  date?: string;
  units?: Units;
}

export interface GeocodeOptions {
  state?: string;
  country?: string;
  limit?: number;
}
