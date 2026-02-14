/**
 * Server factory for multi-tenant operation
 * Creates isolated MCP server instances per user
 */

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
  baseUrl?: string;
  geoUrl?: string;
  maxCacheSize?: number;
  cacheTtl?: {
    current?: number;
    hourly?: number;
    daily?: number;
    alerts?: number;
    geocode?: number;
  };
}

/**
 * Create an MCP server instance for a specific user/tenant
 *
 * This factory function creates isolated server instances for multi-tenant
 * operation. Each instance has its own WeatherClient with the user's API key.
 * No state is shared between server instances.
 *
 * @param accessToken - User's OpenWeatherMap API key
 * @param userId - User identifier (for logging/debugging)
 * @param options - Optional server configuration
 * @returns Configured MCP Server instance
 *
 * @example
 * ```typescript
 * import { createServer } from '@prmichaelsen/weather-mcp';
 *
 * // Create isolated server for a user
 * const server = createServer(
 *   userApiKey,
 *   'user-123',
 *   { name: 'weather-mcp' }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Use with mcp-auth for multi-tenant deployment
 * import { wrapServer } from '@prmichaelsen/mcp-auth';
 * import { createServer } from '@prmichaelsen/weather-mcp';
 *
 * const wrappedServer = wrapServer({
 *   serverFactory: (accessToken, userId) => createServer(accessToken, userId),
 *   authProvider,
 *   tokenResolver,
 *   resourceType: 'openweather',
 *   transport: { type: 'sse', port: 8080 },
 * });
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

  // Create isolated WeatherClient for this user
  const client = new WeatherClient(accessToken, {
    baseUrl: options.baseUrl,
    geoUrl: options.geoUrl,
    maxCacheSize: options.maxCacheSize,
    cacheTtl: options.cacheTtl,
  });

  // Create MCP server instance
  const server = new Server(
    {
      name: options.name || 'weather-mcp',
      version: options.version || '0.1.0',
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
