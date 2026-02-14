# OpenWeatherMap MCP Server - Project Requirements

**Project Name**: OpenWeatherMap MCP Server
**Created**: 2026-02-14
**Status**: Active

---

## Overview

A Model Context Protocol (MCP) server that provides AI agents with access to OpenWeatherMap's One Call API 3.0. This server uses **static MCP configuration** (no dynamic token resolution), similar to the remember-mcp pattern, where API credentials are configured via environment variables.

**API Reference**: [OpenWeatherMap One Call API 3.0](https://openweathermap.org/api/one-call-3)

---

## Problem Statement

AI agents need access to comprehensive weather data including:
- Current weather conditions
- Hourly forecasts (48 hours)
- Daily forecasts (8 days)
- Weather alerts
- Historical weather data
- Air quality information

This MCP server provides a clean, typed interface to OpenWeatherMap's One Call API 3.0, enabling agents to retrieve weather information for any location worldwide.

---

## Goals and Objectives

### Primary Goals
1. Provide MCP tools for all One Call API 3.0 endpoints
2. Use static configuration (environment variables) for API credentials
3. Support both standalone (stdio) and multi-tenant (SSE) modes
4. Follow the remember-mcp pattern for server factory
5. Include comprehensive error handling and validation

### Secondary Goals
1. Cache weather data to reduce API calls
2. Support geocoding for location lookup
3. Include TypeScript types for all API responses
4. Provide clear documentation and examples
5. Support local development with hot reload

---

## Architecture Pattern

This project follows the **static MCP configuration pattern** used by remember-mcp:

### Two-Mode Operation

1. **Standalone Mode** (`src/server.ts`):
   - Runs with stdio transport
   - Uses environment variables for API key
   - Single-user operation
   - Command: `npm run dev`

2. **Multi-Tenant Mode** (`src/server-factory.ts`):
   - Exports factory function for mcp-auth wrapping
   - Creates isolated server instances per user
   - Each user has their own API key (from environment or platform)
   - Used by wrapper servers for production deployment

### Key Differences from Platform Token Pattern

- ❌ **No Platform Token Resolver**: API keys come from environment variables
- ❌ **No Dynamic Credential Fetching**: Credentials are static configuration
- ✅ **Static Configuration**: API keys set via `.env` file
- ✅ **Server Factory**: Exports `createServer(accessToken, userId)` for mcp-auth compatibility
- ✅ **Multi-Tenant Support**: Factory creates isolated instances per user

---

## Functional Requirements

### Core Features

1. **Weather Tools**:
   - Get current weather by coordinates
   - Get hourly forecast (48 hours)
   - Get daily forecast (8 days)
   - Get weather alerts
   - Get historical weather data
   - Get air quality data

2. **Geocoding Tools**:
   - Convert city name to coordinates
   - Reverse geocoding (coordinates to location name)
   - Search locations by name

3. **Server Modes**:
   - Standalone server with stdio transport
   - Factory function for multi-tenant wrapping
   - Both modes use same tool implementations

4. **Configuration**:
   - Environment variable based configuration
   - Support for multiple API keys (multi-tenant)
   - Configurable cache TTL
   - Configurable units (metric/imperial)

---

## Non-Functional Requirements

### Performance
- Cache weather data for 10 minutes (configurable)
- Response time < 2 seconds for cached data
- Response time < 5 seconds for API calls
- Support 100+ requests per minute

### Reliability
- Graceful handling of API rate limits
- Retry logic with exponential backoff
- Fallback to cached data on API errors
- Clear error messages for invalid requests

### Security
- API keys stored in environment variables only
- No API keys in logs or error messages
- Input validation for all coordinates
- Rate limiting per user (multi-tenant mode)

---

## Technical Requirements

### Technology Stack
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.4+
- **Auth Library**: @prmichaelsen/mcp-auth (for multi-tenant mode)
- **Build Tool**: esbuild
- **Testing**: Jest

### Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "@prmichaelsen/mcp-auth": "^7.0.4",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "esbuild": "^0.25.0",
    "tsx": "^4.7.1",
    "@types/node": "^22.10.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2"
  }
}
```

### API Integration
- **OpenWeatherMap One Call API 3.0**
  - Base URL: `https://api.openweathermap.org/data/3.0/onecall`
  - Authentication: API key in query parameter
  - Rate Limit: 1,000 calls/day (free tier)
  - Response Format: JSON

---

## MCP Tools Specification

### 1. Get Current Weather
```typescript
{
  name: "weather_get_current",
  description: "Get current weather conditions for a location",
  inputSchema: {
    type: "object",
    properties: {
      lat: { type: "number", description: "Latitude" },
      lon: { type: "number", description: "Longitude" },
      units: { type: "string", enum: ["metric", "imperial", "standard"], default: "metric" }
    },
    required: ["lat", "lon"]
  }
}
```

### 2. Get Hourly Forecast
```typescript
{
  name: "weather_get_hourly",
  description: "Get hourly weather forecast for 48 hours",
  inputSchema: {
    type: "object",
    properties: {
      lat: { type: "number", description: "Latitude" },
      lon: { type: "number", description: "Longitude" },
      hours: { type: "number", description: "Number of hours (1-48)", default: 48 },
      units: { type: "string", enum: ["metric", "imperial", "standard"], default: "metric" }
    },
    required: ["lat", "lon"]
  }
}
```

### 3. Get Daily Forecast
```typescript
{
  name: "weather_get_daily",
  description: "Get daily weather forecast for 8 days",
  inputSchema: {
    type: "object",
    properties: {
      lat: { type: "number", description: "Latitude" },
      lon: { type: "number", description: "Longitude" },
      days: { type: "number", description: "Number of days (1-8)", default: 8 },
      units: { type: "string", enum: ["metric", "imperial", "standard"], default: "metric" }
    },
    required: ["lat", "lon"]
  }
}
```

### 4. Get Weather Alerts
```typescript
{
  name: "weather_get_alerts",
  description: "Get weather alerts for a location",
  inputSchema: {
    type: "object",
    properties: {
      lat: { type: "number", description: "Latitude" },
      lon: { type: "number", description: "Longitude" }
    },
    required: ["lat", "lon"]
  }
}
```

### 5. Geocode Location
```typescript
{
  name: "weather_geocode",
  description: "Convert city name to coordinates",
  inputSchema: {
    type: "object",
    properties: {
      city: { type: "string", description: "City name" },
      state: { type: "string", description: "State code (US only)" },
      country: { type: "string", description: "Country code (ISO 3166)" },
      limit: { type: "number", description: "Max results", default: 5 }
    },
    required: ["city"]
  }
}
```

---

## Project Structure

```
weather-mcp/
├── src/
│   ├── server.ts                   # Standalone server (stdio)
│   ├── server-factory.ts           # Factory for multi-tenant mode
│   ├── client.ts                   # OpenWeatherMap API client
│   ├── config.ts                   # Configuration management
│   ├── types.ts                    # TypeScript type definitions
│   │
│   ├── tools/                      # MCP tool definitions
│   │   ├── get-current.ts          # Current weather tool
│   │   ├── get-hourly.ts           # Hourly forecast tool
│   │   ├── get-daily.ts            # Daily forecast tool
│   │   ├── get-alerts.ts           # Weather alerts tool
│   │   └── geocode.ts              # Geocoding tool
│   │
│   └── utils/                      # Utilities
│       ├── logger.ts               # Logging utility
│       ├── cache.ts                # Response caching
│       └── error-serializer.ts     # Error handling
│
├── agent/                          # ACP documentation
│   ├── design/
│   │   └── requirements.md         # This file
│   ├── milestones/
│   ├── patterns/
│   ├── tasks/
│   └── progress.yaml
│
├── package.json
├── tsconfig.json
├── esbuild.build.js
├── esbuild.watch.js
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Configuration

**.env.example**:
```env
# OpenWeatherMap API Configuration
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/3.0

# Default Settings
DEFAULT_UNITS=metric
CACHE_TTL_SECONDS=600

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# MCP Configuration
MCP_TRANSPORT=stdio
```

---

## User Stories

### As a Developer
1. I want to clone this server so that I can provide weather data to AI agents
2. I want clear documentation so that I understand how to configure API keys
3. I want working examples so that I can see the tools in action
4. I want to run locally so that I can develop and test without deployment

### As an AI Agent
1. I want to get current weather so that I can answer user questions about conditions
2. I want to get forecasts so that I can help users plan activities
3. I want to get alerts so that I can warn users about severe weather
4. I want to geocode locations so that I can look up weather by city name

---

## Success Criteria

### MVP Success Criteria
- [ ] Project structure created
- [ ] OpenWeatherMap client implemented
- [ ] All 5 core tools implemented
- [ ] Standalone server working (`npm run dev`)
- [ ] Server factory exported for multi-tenant mode
- [ ] Response caching implemented
- [ ] Error handling comprehensive
- [ ] TypeScript types complete
- [ ] README with setup instructions
- [ ] .env.example provided

### Full Release Success Criteria
- [ ] All MVP criteria met
- [ ] Unit tests for all tools
- [ ] E2E tests with real API
- [ ] Documentation complete
- [ ] Example usage in README
- [ ] Published to npm
- [ ] Example wrapper server

---

## Out of Scope

1. **Historical Weather API**: Use separate endpoint (not One Call 3.0)
2. **Weather Maps**: Image/tile APIs not included
3. **Bulk Downloads**: Not supported by One Call API
4. **Custom Alerts**: Only official weather service alerts
5. **Weather Station Data**: Not available in One Call API
6. **Platform Token Resolution**: Using static configuration instead

---

## Constraints

### Technical Constraints
- Must follow MCP protocol specification
- Must use static configuration (no dynamic token resolution)
- Must support both stdio and SSE transports
- Must be compatible with Node.js 20+
- Must follow remember-mcp pattern

### API Constraints
- OpenWeatherMap rate limits (1,000 calls/day free tier)
- Coordinates must be valid (-90 to 90 lat, -180 to 180 lon)
- Historical data limited to 5 days
- Forecast limited to 8 days

### Business Constraints
- Must be open source (MIT license)
- Must include comprehensive documentation
- Must work out-of-the-box with minimal configuration

---

## Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| API rate limits exceeded | High | Medium | Implement caching, warn users about limits |
| API key exposure | High | Low | Environment variables only, clear documentation |
| API changes | Medium | Low | Pin API version, monitor changelog |
| Invalid coordinates | Low | Medium | Input validation, clear error messages |
| Network failures | Medium | Medium | Retry logic, fallback to cache |

---

## Timeline

### Phase 1: Foundation (Week 1)
- Project setup and infrastructure
- OpenWeatherMap client implementation
- Configuration management

### Phase 2: Core Tools (Week 1)
- Implement all 5 MCP tools
- Response caching
- Error handling

### Phase 3: Server Modes (Week 1)
- Standalone server (stdio)
- Server factory for multi-tenant
- Testing both modes

### Phase 4: Documentation (Week 1)
- README with examples
- API documentation
- Setup guide

---

## References

- [OpenWeatherMap One Call API 3.0](https://openweathermap.org/api/one-call-3)
- [OpenWeatherMap Geocoding API](https://openweathermap.org/api/geocoding-api)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [@prmichaelsen/mcp-auth](https://github.com/prmichaelsen/mcp-auth)
- [remember-mcp](https://github.com/prmichaelsen/remember-mcp) - Reference implementation

---

**Status**: Active - Ready for implementation
**Last Updated**: 2026-02-14
**Next Review**: 2026-02-21
