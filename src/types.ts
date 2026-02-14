/**
 * TypeScript type definitions for OpenWeatherMap API
 */

// TODO: Add comprehensive type definitions
// This will be implemented in Task 5

export interface CurrentWeather {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  clouds: number;
  wind_speed: number;
  weather: WeatherCondition[];
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
