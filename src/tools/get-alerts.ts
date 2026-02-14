/**
 * Get Weather Alerts Tool
 * Returns active weather alerts and warnings for a location
 */

import type { WeatherClient } from '../client.js';

export const weatherGetAlerts = {
  name: 'weather_get_alerts',
  description: 'Get active weather alerts and warnings for a location',
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
    },
    required: ['lat', 'lon'],
  },
};

export async function handleWeatherGetAlerts(
  client: WeatherClient,
  args: any
): Promise<string> {
  try {
    const result = await client.getCurrentAndForecast(
      args.lat,
      args.lon,
      {
        exclude: ['current', 'minutely', 'hourly', 'daily'],
      }
    );

    if (!result.alerts || result.alerts.length === 0) {
      return JSON.stringify({
        message: 'No active weather alerts for this location',
        alerts: [],
      }, null, 2);
    }

    return JSON.stringify(result.alerts, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to get weather alerts: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
