/**
 * Configuration management
 * Loads and validates environment variables
 */

import { config as loadEnv } from 'dotenv';
import type { Units } from './types.js';

// Load .env file if it exists
loadEnv();

export interface Config {
  openweather: {
    apiKey: string;
    baseUrl: string;
    geoUrl: string;
  };
  defaults: {
    units: Units;
    cacheTtl: number;
  };
  cache: {
    maxSize: number;
    ttl: {
      current: number;
      hourly: number;
      daily: number;
      alerts: number;
      geocode: number;
    };
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

/**
 * Validate and load configuration from environment variables
 */
function loadConfig(): Config {
  // Required variables
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENWEATHER_API_KEY is required. Get your API key from https://openweathermap.org/api'
    );
  }

  // Validate units
  const units = (process.env.DEFAULT_UNITS || 'metric') as Units;
  const validUnits: Units[] = ['standard', 'metric', 'imperial'];
  if (!validUnits.includes(units)) {
    throw new Error(
      `DEFAULT_UNITS must be one of: ${validUnits.join(', ')}. Got: ${units}`
    );
  }

  // Validate numeric values
  const cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '600');
  if (isNaN(cacheTtl) || cacheTtl < 0) {
    throw new Error('CACHE_TTL_SECONDS must be a positive number');
  }

  const cacheMaxSize = parseInt(process.env.CACHE_MAX_SIZE || '1000');
  if (isNaN(cacheMaxSize) || cacheMaxSize < 1) {
    throw new Error('CACHE_MAX_SIZE must be a positive number');
  }

  const port = parseInt(process.env.PORT || '3000');
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number (1-65535)');
  }

  // Validate transport
  const transport = (process.env.MCP_TRANSPORT || 'stdio') as 'stdio' | 'sse';
  if (transport !== 'stdio' && transport !== 'sse') {
    throw new Error('MCP_TRANSPORT must be either "stdio" or "sse"');
  }

  return {
    openweather: {
      apiKey,
      baseUrl: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/3.0/onecall',
      geoUrl: process.env.OPENWEATHER_GEO_URL || 'https://api.openweathermap.org/geo/1.0',
    },
    defaults: {
      units,
      cacheTtl,
    },
    cache: {
      maxSize: cacheMaxSize,
      ttl: {
        current: parseInt(process.env.CACHE_TTL_CURRENT || '600'),
        hourly: parseInt(process.env.CACHE_TTL_HOURLY || '1800'),
        daily: parseInt(process.env.CACHE_TTL_DAILY || '3600'),
        alerts: parseInt(process.env.CACHE_TTL_ALERTS || '300'),
        geocode: parseInt(process.env.CACHE_TTL_GEOCODE || '86400'),
      },
    },
    server: {
      port,
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
    },
    mcp: {
      transport,
    },
  };
}

// Export singleton config instance
export const config = loadConfig();
