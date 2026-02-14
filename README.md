# OpenWeatherMap MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to comprehensive weather data from OpenWeatherMap's One Call API 3.0.

## 🌤️ Features

- **Current Weather**: Real-time weather conditions for any location
- **Hourly Forecast**: 48-hour detailed weather predictions
- **Daily Forecast**: 8-day weather outlook
- **Weather Alerts**: Severe weather warnings and advisories
- **Geocoding**: Convert city names to coordinates and vice versa
- **Response Caching**: Reduces API calls and improves performance
- **Multi-Mode Support**: Standalone (stdio) or multi-tenant (SSE) operation

## 🚀 Quick Start

> **Note**: This project is currently in initial setup phase. Implementation is in progress.

### Prerequisites

1. Node.js 20+ installed
2. OpenWeatherMap API key ([Get one free](https://openweathermap.org/api))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd weather-mcp

# Install dependencies (coming soon)
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENWEATHER_API_KEY

# Run in development mode (coming soon)
npm run dev
```

## 📋 Project Status

**Current Phase**: Foundation (Milestone 1)  
**Progress**: 10% complete  
**Status**: In Progress

### Completed
- ✅ ACP (Agent Context Protocol) structure initialized
- ✅ Requirements document created for OpenWeatherMap integration
- ✅ Project scope defined (One Call API 3.0)
- ✅ Static configuration pattern documented

### In Progress
- 🔄 Project structure creation (Task 3)

### Next Steps
- Implement OpenWeatherMap API client
- Create 5 core weather tools
- Add response caching
- Implement standalone server (stdio)
- Implement server factory (multi-tenant mode)

See [`agent/progress.yaml`](agent/progress.yaml) for detailed progress tracking.

## 🛠️ Architecture

This server follows the **static MCP configuration pattern** (similar to remember-mcp):

### Two Operation Modes

1. **Standalone Mode** (stdio transport):
   - Single-user operation
   - API key from environment variables
   - Perfect for local development and personal use
   - Command: `npm run dev`

2. **Multi-Tenant Mode** (SSE transport):
   - Multiple users with isolated instances
   - Each user can have their own API key
   - Wrapped with @prmichaelsen/mcp-auth
   - Deployed as a service

### Key Design Principles

- ✅ **Static Configuration**: API keys from environment variables
- ✅ **No Token Resolver**: No dynamic credential fetching
- ✅ **Server Factory Pattern**: Exports `createServer(accessToken, userId)` for multi-tenant wrapping
- ✅ **Response Caching**: Reduces API calls and costs
- ✅ **Type Safety**: Full TypeScript support

## 🌍 Available Tools

### 1. Get Current Weather
```typescript
weather_get_current({
  lat: 40.7128,
  lon: -74.0060,
  units: "metric" // or "imperial", "standard"
})
```

### 2. Get Hourly Forecast
```typescript
weather_get_hourly({
  lat: 40.7128,
  lon: -74.0060,
  hours: 24, // 1-48
  units: "metric"
})
```

### 3. Get Daily Forecast
```typescript
weather_get_daily({
  lat: 40.7128,
  lon: -74.0060,
  days: 7, // 1-8
  units: "metric"
})
```

### 4. Get Weather Alerts
```typescript
weather_get_alerts({
  lat: 40.7128,
  lon: -74.0060
})
```

### 5. Geocode Location
```typescript
weather_geocode({
  city: "New York",
  state: "NY", // optional, US only
  country: "US", // optional, ISO 3166
  limit: 5 // max results
})
```

## 📁 Project Structure

```
weather-mcp/
├── agent/                          # ACP documentation & planning
│   ├── design/
│   │   └── requirements.md         # Project requirements
│   ├── milestones/                 # Project milestones
│   ├── patterns/                   # Architecture patterns
│   ├── tasks/                      # Task tracking
│   └── progress.yaml               # Progress tracking
│
├── src/                            # Source code (coming soon)
│   ├── server.ts                   # Standalone server (stdio)
│   ├── server-factory.ts           # Factory for multi-tenant mode
│   ├── client.ts                   # OpenWeatherMap API client
│   ├── config.ts                   # Configuration management
│   ├── types.ts                    # TypeScript types
│   ├── tools/                      # MCP tool implementations
│   │   ├── get-current.ts
│   │   ├── get-hourly.ts
│   │   ├── get-daily.ts
│   │   ├── get-alerts.ts
│   │   └── geocode.ts
│   └── utils/                      # Utilities
│       ├── logger.ts
│       ├── cache.ts
│       └── error-serializer.ts
│
├── AGENT.md                        # ACP methodology
├── package.json                    # (coming soon)
├── tsconfig.json                   # (coming soon)
├── .env.example                    # (coming soon)
└── README.md                       # This file
```

## 🔧 Configuration

Environment variables (`.env`):

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

## 📚 API Reference

This server integrates with:
- [OpenWeatherMap One Call API 3.0](https://openweathermap.org/api/one-call-3)
- [OpenWeatherMap Geocoding API](https://openweathermap.org/api/geocoding-api)

### Rate Limits

- **Free Tier**: 1,000 calls/day
- **Paid Tiers**: Higher limits available

The server implements response caching (default: 10 minutes) to minimize API calls.

## 🧪 Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests (requires API key)
npm run test:e2e
```

## 📖 Documentation

### For Developers
- [`agent/design/requirements.md`](agent/design/requirements.md) - Complete project requirements
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

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Follows the [Agent Context Protocol](https://github.com/prmichaelsen/agent-context-protocol)

---

**Status**: 🚧 In Development - Foundation Phase  
**Last Updated**: 2026-02-14  
**Next Milestone**: Complete project structure and OpenWeatherMap client implementation
