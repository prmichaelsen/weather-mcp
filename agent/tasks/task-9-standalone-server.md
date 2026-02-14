# Task 9: Implement Standalone Server

**Milestone**: Milestone 2 (Core Implementation)
**Estimated Time**: 2 hours
**Dependencies**: Task 8
**Status**: Not Started

---

## Objective

Implement the standalone MCP server that runs with stdio transport for local development and single-user operation.

## Steps

1. Create `src/server.ts`:
   - Import MCP SDK Server class
   - Import WeatherClient
   - Import all tools
   - Import configuration

2. Initialize server:
   - Create Server instance
   - Set server name and version
   - Configure capabilities (tools)

3. Register list_tools handler:
   - Return all 5 tool definitions
   - Use proper MCP response format

4. Register call_tool handler:
   - Switch on tool name
   - Call appropriate handler function
   - Pass WeatherClient instance
   - Return formatted response
   - Handle errors with McpError

5. Initialize WeatherClient:
   - Load API key from environment
   - Create client instance
   - Validate configuration

6. Connect to stdio transport:
   - Use StdioServerTransport
   - Handle connection lifecycle
   - Handle graceful shutdown

7. Add error handling:
   - Catch initialization errors
   - Handle tool execution errors
   - Log errors appropriately
   - Exit gracefully on fatal errors

8. Add signal handlers:
   - SIGINT (Ctrl+C)
   - SIGTERM
   - Cleanup on exit

## Verification

- [ ] src/server.ts created
- [ ] Server initializes correctly
- [ ] list_tools returns all 5 tools
- [ ] call_tool executes tools correctly
- [ ] WeatherClient initialized with API key
- [ ] Stdio transport connected
- [ ] Error handling comprehensive
- [ ] Graceful shutdown works
- [ ] Can run with `npm run dev`
- [ ] Can test with MCP inspector

## Files to Create

- `src/server.ts`

## Server Implementation Structure

```typescript
#!/usr/bin/env node
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

// Initialize client
const client = new WeatherClient(config.openweather.apiKey);

// Create server
const server = new Server(
  {
    name: 'weather-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register handlers
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
}

// Signal handlers
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

## Testing

Test with MCP inspector:
```bash
npm run dev
```

Or test with npx:
```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

## Notes

- Use stdio transport for single-user mode
- Load API key from environment
- All console.log goes to stderr (not stdout)
- Graceful shutdown on signals
- Proper error handling with McpError
- Server runs continuously until stopped

---

**Previous Task**: [Task 8: Implement Weather Tools](task-8-implement-tools.md)
**Next Task**: [Task 10: Implement Server Factory](task-10-server-factory.md)
