/**
 * Get Daily Forecast Tool
 * Returns daily weather forecast for next 8 days
 */

import type { WeatherClient } from '../client.js';

export const weatherGetDaily = {
  name: 'weather_get_daily',
  description: 'Get daily weather forecast for the next 8 days',
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
      days: {
        type: 'number',
        description: 'Number of days to return (1-8, default: 8)',
        minimum: 1,
        maximum: 8,
        default: 8,
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

export async function handleWeatherGetDaily(
  client: WeatherClient,
  args: any
): Promise<string> {
  try {
    const result = await client.getCurrentAndForecast(
      args.lat,
      args.lon,
      {
        exclude: ['current', 'minutely', 'hourly', 'alerts'],
        units: args.units || 'metric',
      }
    );

    if (!result.daily) {
      throw new Error('No daily forecast data available');
    }

    // Limit to requested days
    const days = args.days || 8;
    const limitedDaily = result.daily.slice(0, Math.min(days, 8));

    return JSON.stringify(limitedDaily, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to get daily forecast: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
