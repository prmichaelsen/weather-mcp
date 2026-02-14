/**
 * Get Hourly Forecast Tool
 * Returns hourly weather forecast for next 48 hours
 */

import type { WeatherClient } from '../client.js';

export const weatherGetHourly = {
  name: 'weather_get_hourly',
  description: 'Get hourly weather forecast for the next 48 hours',
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
      hours: {
        type: 'number',
        description: 'Number of hours to return (1-48, default: 48)',
        minimum: 1,
        maximum: 48,
        default: 48,
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

export async function handleWeatherGetHourly(
  client: WeatherClient,
  args: any
): Promise<string> {
  try {
    const result = await client.getCurrentAndForecast(
      args.lat,
      args.lon,
      {
        exclude: ['current', 'minutely', 'daily', 'alerts'],
        units: args.units || 'metric',
      }
    );

    if (!result.hourly) {
      throw new Error('No hourly forecast data available');
    }

    // Limit to requested hours
    const hours = args.hours || 48;
    const limitedHourly = result.hourly.slice(0, Math.min(hours, 48));

    return JSON.stringify(limitedHourly, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to get hourly forecast: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
