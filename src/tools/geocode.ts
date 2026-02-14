/**
 * Geocode Location Tool
 * Converts city name to geographic coordinates
 */

import type { WeatherClient } from '../client.js';

export const weatherGeocode = {
  name: 'weather_geocode',
  description: 'Convert city name to geographic coordinates',
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name',
      },
      state: {
        type: 'string',
        description: 'State code (US only, e.g., "NY")',
      },
      country: {
        type: 'string',
        description: 'Country code (ISO 3166, e.g., "US")',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 5)',
        minimum: 1,
        maximum: 10,
        default: 5,
      },
    },
    required: ['city'],
  },
};

export async function handleWeatherGeocode(
  client: WeatherClient,
  args: any
): Promise<string> {
  try {
    const results = await client.geocode(args.city, {
      state: args.state,
      country: args.country,
      limit: args.limit || 5,
    });

    if (results.length === 0) {
      return JSON.stringify({
        message: 'No locations found matching the query',
        results: [],
      }, null, 2);
    }

    return JSON.stringify(results, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to geocode location: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
