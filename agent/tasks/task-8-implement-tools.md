# Task 8: Implement Weather Tools

**Milestone**: Milestone 2 (Core Implementation)
**Estimated Time**: 4 hours
**Dependencies**: Task 7 (Milestone 1 complete)
**Status**: Not Started

---

## Objective

Implement all 5 MCP weather tools with proper input validation, error handling, and response formatting.

## Steps

1. Create tool directory structure:
   ```bash
   mkdir -p src/tools
   ```

2. Implement `src/tools/get-current.ts`:
   - Tool definition with schema
   - Handler function
   - Call WeatherClient.getCurrentAndForecast()
   - Exclude unnecessary data (minutely, hourly, daily, alerts)
   - Format response as JSON string

3. Implement `src/tools/get-hourly.ts`:
   - Tool definition with schema
   - Handler function
   - Call WeatherClient.getCurrentAndForecast()
   - Exclude unnecessary data (current, minutely, daily, alerts)
   - Limit to requested hours (1-48)
   - Format response as JSON string

4. Implement `src/tools/get-daily.ts`:
   - Tool definition with schema
   - Handler function
   - Call WeatherClient.getCurrentAndForecast()
   - Exclude unnecessary data (current, minutely, hourly, alerts)
   - Limit to requested days (1-8)
   - Format response as JSON string

5. Implement `src/tools/get-alerts.ts`:
   - Tool definition with schema
   - Handler function
   - Call WeatherClient.getCurrentAndForecast()
   - Exclude unnecessary data (current, minutely, hourly, daily)
   - Return only alerts
   - Handle case when no alerts exist
   - Format response as JSON string

6. Implement `src/tools/geocode.ts`:
   - Tool definition with schema
   - Handler function
   - Call WeatherClient.geocode()
   - Support city, state, country parameters
   - Limit results
   - Format response as JSON string

7. Create `src/tools/index.ts`:
   - Export all tool definitions
   - Export all handler functions
   - Provide typed exports

8. Add input validation for all tools:
   - Validate latitude/longitude ranges
   - Validate units parameter
   - Validate hours/days limits
   - Provide clear error messages

9. Add error handling:
   - Catch API errors
   - Catch validation errors
   - Format errors for MCP response
   - Log errors appropriately

## Verification

- [ ] All 5 tool files created
- [ ] Tool definitions match MCP schema format
- [ ] Handler functions implemented
- [ ] Input validation works correctly
- [ ] Error handling comprehensive
- [ ] Responses formatted as JSON strings
- [ ] src/tools/index.ts exports all tools
- [ ] TypeScript compiles without errors
- [ ] Tools can be imported by server

## Files to Create

- `src/tools/get-current.ts`
- `src/tools/get-hourly.ts`
- `src/tools/get-daily.ts`
- `src/tools/get-alerts.ts`
- `src/tools/geocode.ts`
- `src/tools/index.ts`

## Tool Implementation Pattern

Each tool file should follow this pattern:

```typescript
import { WeatherClient } from '../client.js';

// Tool definition
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
        description: 'Units of measurement',
        default: 'metric',
      },
    },
    required: ['lat', 'lon'],
  },
};

// Handler function
export async function handleWeatherGetCurrent(
  client: WeatherClient,
  args: any
): Promise<string> {
  try {
    // Validate inputs
    if (args.lat < -90 || args.lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (args.lon < -180 || args.lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Call API
    const result = await client.getCurrentAndForecast(
      args.lat,
      args.lon,
      {
        exclude: ['minutely', 'hourly', 'daily', 'alerts'],
        units: args.units || 'metric',
      }
    );

    // Return formatted response
    return JSON.stringify(result.current, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to get current weather: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
```

## Notes

- Each tool is self-contained
- Handlers receive WeatherClient instance
- All responses are JSON strings
- Input validation before API calls
- Clear error messages
- Use exclude parameter to reduce response size
- Follow MCP tool schema specification

---

**Previous Task**: [Task 7: Create README](task-7-readme.md)
**Next Task**: [Task 9: Implement Standalone Server](task-9-standalone-server.md)
