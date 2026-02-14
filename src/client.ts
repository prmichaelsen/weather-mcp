/**
 * OpenWeatherMap API client wrapper
 * Handles all API interactions with caching and error handling
 */

export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class WeatherClient {
  private config: ClientConfig;

  constructor(apiKey: string, options?: Partial<ClientConfig>) {
    this.config = {
      apiKey,
      baseUrl: options?.baseUrl || 'https://api.openweathermap.org/data/3.0',
      timeout: options?.timeout || 30000,
    };
  }

  // TODO: Implement API methods
  // This will be implemented in Task 5
}
