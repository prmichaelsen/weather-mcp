/**
 * Get Current Weather Tool
 * Returns current weather conditions for a location
 */

import type { WeatherClient } from '../client.js';

export const weatherGetCurrent = {
  name: 'weather_get_current',
  description: 'Get current weather conditions for a location',
  inputSchema: {
    type: 'object',
    properties: {
      lat: {
        type: 'number',
        description: 'Latitude (-90 to 90)',
      },
      lon: {
        type: 'number',
        description: 'Longitude (-180 to 180)',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'standard'],
        description: 'Units of measurement (default: metric)',
        default: 'metric',
      },
    },
    required: ['lat', 'lon'],
  },
};

export async function handleWeatherGetCurrent(
  client: WeatherClient,
  args: any
): Promise<string> {
  try {
    const result = await client.getCurrentAndForecast(
      args.lat,
      args.lon,
      {
        exclude: ['minutely', 'hourly', 'daily', 'alerts'],
        units: args.units || 'metric',
      }
    );

    if (!result.current) {
      throw new Error('No current weather data available');
    }

    return JSON.stringify(result.current, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to get current weather: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
