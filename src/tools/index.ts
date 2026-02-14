/**
 * MCP tool definitions and handlers
 * Exports all weather tools
 */

// TODO: Implement all 5 weather tools
// This will be implemented in Task 8

export const weatherGetCurrent = {
  name: 'weather_get_current',
  description: 'Get current weather conditions for a location',
  inputSchema: {
    type: 'object',
    properties: {
      lat: { type: 'number', description: 'Latitude (-90 to 90)' },
      lon: { type: 'number', description: 'Longitude (-180 to 180)' },
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'standard'],
        description: 'Units of measurement',
        default: 'metric',
      },
    },
    required: ['lat', 'lon'],
  },
};

// TODO: Add remaining tool definitions and handlers
