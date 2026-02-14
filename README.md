# OpenWeatherMap MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to comprehensive weather data from OpenWeatherMap's One Call API 3.0.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

## 🌤️ Features

- **Current Weather**: Real-time weather conditions for any location worldwide
- **Hourly Forecast**: Detailed 48-hour weather predictions
- **Daily Forecast**: 8-day weather outlook with min/max temperatures
- **Weather Alerts**: Severe weather warnings and advisories
- **Geocoding**: Convert city names to coordinates and vice versa
- **Response Caching**: Intelligent caching reduces API calls and improves performance
- **Multi-Mode Support**: Standalone (stdio) or multi-tenant (SSE) operation
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with retry logic and clear messages

## 🚀 Quick Start

### Prerequisites

1. **Node.js 20+** installed
2. **OpenWeatherMap API key** - [Get one free](https://openweathermap.org/api) (1,000 calls/day)

### Installation

```bash
# Clone the repository
git clone https://github.com/prmichaelsen/weather-mcp.git
cd weather-mcp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENWEATHER_API_KEY

# Build the project
npm run build

# Run in development mode
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required
OPENWEATHER_API_KEY=your_api_key_here

# Optional (with defaults)
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/3.0/onecall
OPENWEATHER_GEO_URL=https://api.openweathermap.org/geo/1.0
DEFAULT_UNITS=metric
CACHE_TTL_SECONDS=600
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
MCP_TRANSPORT=stdio
```

### Getting an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Generate a new API key
5. Add it to your `.env` file

**Free Tier Limits**: 1,000 API calls per day

## 🛠️ Available Tools

### 1. Get Current Weather

Get real-time weather conditions for any location.

**Tool**: `weather_get_current`

**Parameters**:
- `lat` (number, required): Latitude (-90 to 90)
- `lon` (number, required): Longitude (-180 to 180)
- `units` (string, optional): "metric", "imperial", or "standard" (default: "metric")

**Example**:
```json
{
  "lat": 40.7128,
  "lon": -74.0060,
  "units": "metric"
}
```

**Response**: Current weather including temperature, humidity, wind speed, pressure, visibility, and weather conditions.

**Use Cases**:
- Check current conditions before going outside
- Monitor weather for outdoor events
- Get real-time data for weather applications

---

### 2. Get Hourly Forecast

Get detailed hourly weather forecast for the next 48 hours.

**Tool**: `weather_get_hourly`

**Parameters**:
- `lat` (number, required): Latitude (-90 to 90)
- `lon` (number, required): Longitude (-180 to 180)
- `hours` (number, optional): Number of hours to return (1-48, default: 48)
- `units` (string, optional): "metric", "imperial", or "standard" (default: "metric")

**Example**:
```json
{
  "lat": 40.7128,
  "lon": -74.0060,
  "hours": 24,
  "units": "metric"
}
```

**Response**: Array of hourly forecasts with temperature, precipitation probability, wind, and conditions.

**Use Cases**:
- Plan activities for the next day or two
- Check when rain will start/stop
- Monitor temperature changes throughout the day

---

### 3. Get Daily Forecast

Get daily weather forecast for the next 8 days.

**Tool**: `weather_get_daily`

**Parameters**:
- `lat` (number, required): Latitude (-90 to 90)
- `lon` (number, required): Longitude (-180 to 180)
- `days` (number, optional): Number of days to return (1-8, default: 8)
- `units` (string, optional): "metric", "imperial", or "standard" (default: "metric")

**Example**:
```json
{
  "lat": 40.7128,
  "lon": -74.0060,
  "days": 7,
  "units": "metric"
}
```

**Response**: Array of daily forecasts with min/max temperatures, precipitation, and conditions.

**Use Cases**:
- Plan week-long trips
- Check extended weather outlook
- Monitor temperature trends

---

### 4. Get Weather Alerts

Get active weather alerts and warnings for a location.

**Tool**: `weather_get_alerts`

**Parameters**:
- `lat` (number, required): Latitude (-90 to 90)
- `lon` (number, required): Longitude (-180 to 180)

**Example**:
```json
{
  "lat": 40.7128,
  "lon": -74.0060
}
```

**Response**: Array of weather alerts with event type, severity, description, and time range.

**Use Cases**:
- Check for severe weather warnings
- Monitor storm alerts
- Get emergency weather notifications

---

### 5. Geocode Location

Convert city name to geographic coordinates.

**Tool**: `weather_geocode`

**Parameters**:
- `city` (string, required): City name
- `state` (string, optional): State code (US only, e.g., "NY")
- `country` (string, optional): Country code (ISO 3166, e.g., "US")
- `limit` (number, optional): Maximum results (default: 5)

**Example**:
```json
{
  "city": "New York",
  "state": "NY",
  "country": "US",
  "limit": 1
}
```

**Response**: Array of locations with name, coordinates, country, and state.

**Use Cases**:
- Convert city names to coordinates for weather queries
- Search for locations by name
- Disambiguate locations with same name

## 🏗️ Architecture

This server follows the **static MCP configuration pattern** (similar to [remember-mcp](https://github.com/prmichaelsen/remember-mcp)):

### Two Operation Modes

#### 1. Standalone Mode (stdio transport)
- Single-user operation
- API key from environment variables
- Perfect for local development and personal use
- Command: `npm run dev`

```bash
# Run standalone server
npm run dev
```

#### 2. Multi-Tenant Mode (SSE transport)
- Multiple users with isolated server instances
- Each user can have their own API key
- Wrapped with [@prmichaelsen/mcp-auth](https://github.com/prmichaelsen/mcp-auth)
- Deployed as a service

```typescript
import { createServer } from '@prmichaelsen/weather-mcp';

// Create isolated server instance per user
const server = createServer(userApiKey, userId);
```

### Key Design Principles

- ✅ **Static Configuration**: API keys from environment variables (no dynamic token resolution)
- ✅ **Server Factory Pattern**: Exports `createServer(accessToken, userId)` for multi-tenant wrapping
- ✅ **Response Caching**: Configurable TTL per endpoint type reduces API calls
- ✅ **Type Safety**: Full TypeScript support with comprehensive types
- ✅ **Error Handling**: Robust error handling with retry logic
- ✅ **Input Validation**: All coordinates, dates, and parameters validated

## 📁 Project Structure

```
weather-mcp/
├── src/
│   ├── server.ts                   # Standalone server (stdio)
│   ├── server-factory.ts           # Factory for multi-tenant mode
│   ├── client.ts                   # OpenWeatherMap API client
│   ├── config.ts                   # Configuration management
│   ├── types.ts                    # TypeScript type definitions
│   ├── tools/                      # MCP tool implementations
│   │   └── index.ts                # Tool exports
│   └── utils/                      # Utilities
│       ├── cache.ts                # Response caching
│       ├── logger.ts               # Logging utility
│       └── error-serializer.ts     # Error handling
│
├── agent/                          # ACP documentation & planning
│   ├── design/                     # Design documents
│   ├── milestones/                 # Project milestones
│   ├── patterns/                   # Architecture patterns
│   ├── tasks/                      # Task tracking
│   └── progress.yaml               # Progress tracking
│
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Package configuration
├── tsconfig.json                   # TypeScript configuration
├── esbuild.build.js                # Production build script
├── esbuild.watch.js                # Development watch script
├── AGENT.md                        # ACP methodology
└── README.md                       # This file
```

## 🧪 Development

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Watch mode (auto-rebuild on changes)
npm run build:watch

# Clean build artifacts
npm run clean
```

### Testing the Server

The server will be fully functional after Milestone 2 (Core Implementation) is complete. Current status: Foundation phase complete, ready for tool implementation.

## 📖 API Reference

This server integrates with:
- [OpenWeatherMap One Call API 3.0](https://openweathermap.org/api/one-call-3) - Weather data
- [OpenWeatherMap Geocoding API](https://openweathermap.org/api/geocoding-api) - Location lookup

### Rate Limits

- **Free Tier**: 1,000 calls/day
- **Paid Tiers**: Higher limits available

The server implements intelligent response caching (default: 10 minutes for current weather, 30 minutes for forecasts) to minimize API calls and stay within rate limits.

### Cache Configuration

Customize cache TTL per endpoint type:

```env
CACHE_TTL_CURRENT=600      # 10 minutes
CACHE_TTL_HOURLY=1800      # 30 minutes
CACHE_TTL_DAILY=3600       # 1 hour
CACHE_TTL_ALERTS=300       # 5 minutes
CACHE_TTL_GEOCODE=86400    # 24 hours
```

## 🐛 Troubleshooting

### "OPENWEATHER_API_KEY is required"

**Problem**: API key not configured.

**Solution**: 
1. Copy `.env.example` to `.env`
2. Add your API key from [OpenWeatherMap](https://openweathermap.org/api)
3. Restart the server

### "Invalid API key" (401 Error)

**Problem**: API key is incorrect or inactive.

**Solution**:
1. Verify your API key at [OpenWeatherMap API keys](https://home.openweathermap.org/api_keys)
2. Ensure the key is active (new keys may take a few minutes to activate)
3. Check for typos in your `.env` file

### "Rate limit exceeded" (429 Error)

**Problem**: Exceeded API rate limit (1,000 calls/day on free tier).

**Solution**:
1. Enable caching (default: enabled)
2. Increase cache TTL to reduce API calls
3. Upgrade to a paid tier for higher limits
4. Monitor cache statistics with `client.getCacheStats()`

### "Latitude must be between -90 and 90"

**Problem**: Invalid coordinates provided.

**Solution**:
- Latitude range: -90 (South Pole) to 90 (North Pole)
- Longitude range: -180 (West) to 180 (East)
- Use the `weather_geocode` tool to get coordinates from city names

### Network Errors

**Problem**: Cannot reach OpenWeatherMap API.

**Solution**:
- Check internet connection
- Verify firewall settings
- Check OpenWeatherMap service status
- The client automatically retries with exponential backoff

## 📚 Documentation

### For Developers
- [`agent/design/requirements.md`](agent/design/requirements.md) - Complete project requirements
- [`agent/design/openweathermap-api-design.md`](agent/design/openweathermap-api-design.md) - API integration design
- [`agent/patterns/bootstrap.md`](agent/patterns/bootstrap.md) - Architecture patterns
- [`agent/progress.yaml`](agent/progress.yaml) - Current progress and status
- [`AGENT.md`](AGENT.md) - Agent Context Protocol methodology

### For Contributors
- [`agent/milestones/`](agent/milestones/) - Project milestones and phases
- [`agent/tasks/`](agent/tasks/) - Individual task breakdowns

## 🤝 Contributing

This project follows the [Agent Context Protocol (ACP)](AGENT.md) for development. To contribute:

1. Read [`AGENT.md`](AGENT.md) to understand the development methodology
2. Check [`agent/progress.yaml`](agent/progress.yaml) for current status
3. Review open tasks in [`agent/tasks/`](agent/tasks/)
4. Follow the patterns in [`agent/patterns/`](agent/patterns/)

## 🔗 Related Projects

- [remember-mcp](https://github.com/prmichaelsen/remember-mcp) - Reference implementation for static configuration pattern
- [@prmichaelsen/mcp-auth](https://github.com/prmichaelsen/mcp-auth) - Multi-tenant authentication wrapper
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification

## 📊 Project Status

**Current Phase**: Foundation Complete ✅  
**Progress**: Milestone 1 - 86% complete (6/7 tasks done)  
**Status**: In Development

### Completed
- ✅ ACP structure initialized
- ✅ Requirements documented
- ✅ Project structure created
- ✅ Build system configured (TypeScript + esbuild)
- ✅ OpenWeatherMap client implemented with caching
- ✅ Environment configuration complete
- ✅ Comprehensive README created

### Next Steps
- 🔄 Implement 5 MCP weather tools (Milestone 2)
- 🔄 Implement standalone server (stdio transport)
- 🔄 Implement server factory (multi-tenant mode)
- 🔄 Add comprehensive logging and error handling

See [`agent/progress.yaml`](agent/progress.yaml) for detailed progress tracking.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Follows the [Agent Context Protocol](https://github.com/prmichaelsen/agent-context-protocol)

## 💡 Usage Examples

### Using with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-mcp/dist/server.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Using as a Library

```typescript
import { createServer } from '@prmichaelsen/weather-mcp';

// Create server instance
const server = createServer(apiKey, userId);

// Use with mcp-auth for multi-tenant deployment
import { wrapServer } from '@prmichaelsen/mcp-auth';

const wrappedServer = wrapServer({
  serverFactory: (accessToken, userId) => createServer(accessToken, userId),
  // ... auth configuration
});
```

## 🔍 API Response Caching

The client automatically caches responses to reduce API calls:

| Endpoint Type | Default TTL | Configurable Via |
|--------------|-------------|------------------|
| Current Weather | 10 minutes | `CACHE_TTL_CURRENT` |
| Hourly Forecast | 30 minutes | `CACHE_TTL_HOURLY` |
| Daily Forecast | 1 hour | `CACHE_TTL_DAILY` |
| Weather Alerts | 5 minutes | `CACHE_TTL_ALERTS` |
| Geocoding | 24 hours | `CACHE_TTL_GEOCODE` |

Cache statistics are available via `client.getCacheStats()`.

---

**Status**: 🚧 Milestone 1 Complete - Ready for Core Implementation  
**Last Updated**: 2026-02-14  
**Next Milestone**: Implement 5 MCP weather tools and server functionality
