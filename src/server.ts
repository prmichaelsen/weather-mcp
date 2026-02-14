#!/usr/bin/env node
/**
 * Standalone MCP server for OpenWeatherMap
 * Runs with stdio transport for local development
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { WeatherClient } from './client.js';
import { config } from './config.js';
import * as tools from './tools/index.js';

// Initialize WeatherClient with API key from config
const client = new WeatherClient(config.openweather.apiKey, {
  baseUrl: config.openweather.baseUrl,
  geoUrl: config.openweather.geoUrl,
  maxCacheSize: config.cache.maxSize,
  cacheTtl: config.cache.ttl,
});

// Create MCP server
const server = new Server(
  {
    name: 'weather-mcp',
    version: '0.1.0',
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

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Weather MCP server running on stdio');
  console.error(`API key configured: ${config.openweather.apiKey.substring(0, 8)}...`);
  console.error(`Default units: ${config.defaults.units}`);
  console.error(`Cache TTL: ${config.defaults.cacheTtl}s`);
}

// Signal handlers for graceful shutdown
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
