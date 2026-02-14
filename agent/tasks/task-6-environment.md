# Task 6: Create Environment Configuration

**Milestone**: Milestone 1 (Project Foundation)
**Estimated Time**: 1 hour
**Dependencies**: Task 5
**Status**: Not Started

---

## Objective

Create environment configuration files and utilities for managing API keys, settings, and runtime configuration.

## Steps

1. Create `.env.example`:
   - OpenWeatherMap API key placeholder
   - Base URL configuration
   - Default units setting
   - Cache TTL configuration
   - Server port
   - Node environment
   - Log level

2. Create `src/config.ts`:
   - Load environment variables
   - Validate required variables
   - Provide default values
   - Export typed configuration object
   - Environment-specific settings

3. Update `.gitignore`:
   - Add `.env`
   - Add `.env.local`
   - Add `node_modules/`
   - Add `dist/`
   - Add `*.log`
   - Add `.DS_Store`

4. Create configuration validation:
   - Check required variables on startup
   - Provide helpful error messages
   - Validate API key format
   - Validate numeric values

5. Document environment setup in README:
   - How to get OpenWeatherMap API key
   - How to copy .env.example to .env
   - Required vs optional variables
   - Default values

## Verification

- [ ] .env.example created with all variables
- [ ] src/config.ts created
- [ ] Configuration validation implemented
- [ ] .gitignore updated
- [ ] TypeScript types for config
- [ ] Helpful error messages for missing variables
- [ ] Default values provided where appropriate
- [ ] README documents environment setup

## Files to Create

- `.env.example`
- `src/config.ts`
- `.gitignore` (update)

## .env.example Content

```env
# OpenWeatherMap API Configuration
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/3.0

# Geocoding API
OPENWEATHER_GEO_URL=https://api.openweathermap.org/geo/1.0

# Default Settings
DEFAULT_UNITS=metric
CACHE_TTL_SECONDS=600

# Server Configuration (for multi-tenant mode)
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# MCP Configuration
MCP_TRANSPORT=stdio
```

## Configuration Structure

```typescript
export interface Config {
  openweather: {
    apiKey: string;
    baseUrl: string;
    geoUrl: string;
  };
  defaults: {
    units: 'standard' | 'metric' | 'imperial';
    cacheTtl: number;
  };
  server: {
    port: number;
    nodeEnv: string;
    logLevel: string;
  };
  mcp: {
    transport: 'stdio' | 'sse';
  };
}
```

## Validation Rules

- `OPENWEATHER_API_KEY`: Required, non-empty string
- `OPENWEATHER_BASE_URL`: Optional, defaults to OpenWeatherMap URL
- `DEFAULT_UNITS`: Optional, must be 'standard', 'metric', or 'imperial'
- `CACHE_TTL_SECONDS`: Optional, must be positive number
- `PORT`: Optional, must be valid port number (1-65535)

## Notes

- Never commit .env files to git
- Use .env.example as template
- Validate configuration on startup
- Provide clear error messages
- Support environment-specific overrides
- Document all variables in README

---

**Previous Task**: [Task 5: Create Client Wrapper](task-5-client-wrapper.md)
**Next Task**: [Task 7: Create README](task-7-readme.md)
