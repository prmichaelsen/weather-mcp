/**
 * MCP tool definitions and handlers
 * Exports all weather tools
 */

// Export tool definitions
export { weatherGetCurrent, handleWeatherGetCurrent } from './get-current.js';
export { weatherGetHourly, handleWeatherGetHourly } from './get-hourly.js';
export { weatherGetDaily, handleWeatherGetDaily } from './get-daily.js';
export { weatherGetAlerts, handleWeatherGetAlerts } from './get-alerts.js';
export { weatherGeocode, handleWeatherGeocode } from './geocode.js';
