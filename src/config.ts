/**
 * Configuration management
 * Loads and validates environment variables
 */

export interface Config {
  openweather: {
    apiKey: string;
    baseUrl: string;
    geoUrl: string;
  };
  defaults: {
    units: 'standard' | 'metric' | 'imperial';
    cacheTtl: number;
  };
  server: {
    port: number;
    nodeEnv: string;
    logLevel: string;
  };
  mcp: {
    transport: 'stdio' | 'sse';
  };
}

// TODO: Implement configuration loading
// This will be implemented in Task 6
export const config: Config = {
  openweather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    baseUrl: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/3.0',
    geoUrl: process.env.OPENWEATHER_GEO_URL || 'https://api.openweathermap.org/geo/1.0',
  },
  defaults: {
    units: (process.env.DEFAULT_UNITS as any) || 'metric',
    cacheTtl: parseInt(process.env.CACHE_TTL_SECONDS || '600'),
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  mcp: {
    transport: (process.env.MCP_TRANSPORT as any) || 'stdio',
  },
};
