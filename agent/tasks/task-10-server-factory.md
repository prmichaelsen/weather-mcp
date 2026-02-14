# Task 10: Implement Server Factory

**Milestone**: Milestone 2 (Core Implementation)
**Estimated Time**: 2 hours
**Dependencies**: Task 9
**Status**: Not Started

---

## Objective

Implement the server factory function that creates isolated MCP server instances for multi-tenant operation. This enables the server to be wrapped by @prmichaelsen/mcp-auth for production deployment.

## Steps

1. Create `src/server-factory.ts`:
   - Export createServer function
   - Accept accessToken and userId parameters
   - Return configured Server instance

2. Implement createServer function:
   - Validate parameters (accessToken, userId required)
   - Create WeatherClient with accessToken (API key)
   - Create Server instance
   - Register list_tools handler
   - Register call_tool handler
   - Return server instance

3. Ensure no shared state:
   - Each server instance is isolated
   - Each has its own WeatherClient
   - No global variables
   - No shared caches between users

4. Add TypeScript types:
   - ServerOptions interface
   - Proper return type (Server)
   - Parameter types

5. Add JSDoc documentation:
   - Function purpose
   - Parameter descriptions
   - Return value description
   - Usage examples

6. Test factory function:
   - Can create multiple instances
   - Each instance is isolated
   - Instances don't share state
   - Works with mcp-auth wrapper

## Verification

- [ ] src/server-factory.ts created
- [ ] createServer function exported
- [ ] Accepts accessToken and userId
- [ ] Returns Server instance
- [ ] No shared state between instances
- [ ] TypeScript types defined
- [ ] JSDoc documentation complete
- [ ] Can be imported by wrapper projects
- [ ] TypeScript compiles without errors
- [ ] Factory creates working servers

## Files to Create

- `src/server-factory.ts`

## Server Factory Implementation

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { WeatherClient } from './client.js';
import * as tools from './tools/index.js';

export interface ServerOptions {
  name?: string;
  version?: string;
}

/**
 * Create an MCP server instance for a specific user/tenant
 *
 * This factory function creates isolated server instances for multi-tenant
 * operation. Each instance has its own WeatherClient with the user's API key.
 *
 * @param accessToken - User's OpenWeatherMap API key
 * @param userId - User identifier (for logging/debugging)
 * @param options - Optional server configuration
 * @returns Configured MCP Server instance
 *
 * @example
 * ```typescript
 * import { createServer } from '@your-org/weather-mcp';
 *
 * const server = createServer(
 *   process.env.OPENWEATHER_API_KEY!,
 *   'user-123'
 * );
 * ```
 */
export function createServer(
  accessToken: string,
  userId: string,
  options: ServerOptions = {}
): Server {
  // Validate parameters
  if (!accessToken) {
    throw new Error('accessToken is required');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  // Create isolated client for this user
  const client = new WeatherClient(accessToken);

  // Create server instance
  const server = new Server(
    {
      name: options.name || 'weather-mcp',
      version: options.version || '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        tools.weatherGetCurrent,
        tools.weatherGetHourly,
        tools.weatherGetDaily,
        tools.weatherGetAlerts,
        tools.weatherGeocode,
      ],
    };
  });

  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: string;

      switch (name) {
        case 'weather_get_current':
          result = await tools.handleWeatherGetCurrent(client, args);
          break;
        case 'weather_get_hourly':
          result = await tools.handleWeatherGetHourly(client, args);
          break;
        case 'weather_get_daily':
          result = await tools.handleWeatherGetDaily(client, args);
          break;
        case 'weather_get_alerts':
          result = await tools.handleWeatherGetAlerts(client, args);
          break;
        case 'weather_geocode':
          result = await tools.handleWeatherGeocode(client, args);
          break;
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  return server;
}
```

## Usage in Wrapper Project

```typescript
// In wrapper server project
import { wrapServer } from '@prmichaelsen/mcp-auth';
import { createServer } from '@your-org/weather-mcp';

const wrappedServer = wrapServer({
  serverFactory: (accessToken: string, userId: string) => {
    return createServer(accessToken, userId);
  },
  authProvider,
  tokenResolver,
  resourceType: 'openweather',
  transport: {
    type: 'sse',
    port: 8080,
  },
});

await wrappedServer.start();
```

## Notes

- Factory pattern enables multi-tenancy
- Each server instance is completely isolated
- No shared state between users
- Each user has their own API key
- Compatible with @prmichaelsen/mcp-auth
- Can be used in wrapper server projects
- Follows remember-mcp pattern

---

**Previous Task**: [Task 9: Implement Standalone Server](task-9-standalone-server.md)
**Next Task**: [Task 11: Add Response Caching](task-11-response-caching.md)
