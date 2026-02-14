# OpenWeatherMap One Call API 3.0 Integration Design

**Concept**: Integration design for OpenWeatherMap One Call API 3.0
**Created**: 2026-02-14
**Status**: Design Specification

---

## Overview

This document specifies the integration with OpenWeatherMap's One Call API 3.0, including all available endpoints, request/response formats, authentication, and error handling strategies.

## Problem Statement

The MCP server needs to access comprehensive weather data from OpenWeatherMap. The One Call API 3.0 provides multiple endpoints for different use cases (current weather, forecasts, historical data, summaries). We need to understand each endpoint's capabilities and design appropriate MCP tools around them.

## Solution

Integrate with 4 main One Call API 3.0 endpoints, each serving a specific purpose:

1. **Current & Forecast** - Real-time and future weather
2. **Time Machine** - Historical weather data
3. **Day Summary** - Aggregated daily statistics
4. **Weather Overview** - Human-readable AI summaries

---

## API Endpoints

### Base Configuration

- **Base URL**: `https://api.openweathermap.org/data/3.0/onecall`
- **Authentication**: Query parameter `appid={API_KEY}`
- **Rate Limit**: 1,000 calls/day (free tier), higher for paid tiers
- **Response Format**: JSON
- **Coordinates**: Latitude (-90 to 90), Longitude (-180 to 180)

---

## 1. Current & Forecast Endpoint

### Endpoint
```
GET /data/3.0/onecall?lat={lat}&lon={lon}&appid={API_KEY}
```

### Purpose
Primary endpoint for current weather and forecasts. Returns comprehensive weather data including current conditions, minutely precipitation forecast, hourly forecast, daily forecast, and weather alerts.

### Required Parameters
- `lat` (number): Latitude, decimal (-90 to 90)
- `lon` (number): Longitude, decimal (-180 to 180)
- `appid` (string): Your API key

### Optional Parameters
- `exclude` (string): Comma-separated list of data parts to exclude
  - Options: `current`, `minutely`, `hourly`, `daily`, `alerts`
  - Example: `exclude=minutely,alerts`
- `units` (string): Units of measurement
  - Options: `standard` (Kelvin), `metric` (Celsius), `imperial` (Fahrenheit)
  - Default: `standard`
- `lang` (string): Language code for weather descriptions
  - Example: `en`, `es`, `fr`, `de`

### Response Structure
```json
{
  "lat": 33.44,
  "lon": -94.04,
  "timezone": "America/Chicago",
  "timezone_offset": -21600,
  "current": {
    "dt": 1684929490,
    "sunrise": 1684926645,
    "sunset": 1684977332,
    "temp": 292.55,
    "feels_like": 292.87,
    "pressure": 1014,
    "humidity": 89,
    "dew_point": 290.69,
    "uvi": 0.16,
    "clouds": 53,
    "visibility": 10000,
    "wind_speed": 3.13,
    "wind_deg": 93,
    "wind_gust": 6.71,
    "weather": [
      {
        "id": 803,
        "main": "Clouds",
        "description": "broken clouds",
        "icon": "04d"
      }
    ]
  },
  "minutely": [
    {
      "dt": 1684929540,
      "precipitation": 0
    }
    // ... 60 entries (1 per minute)
  ],
  "hourly": [
    {
      "dt": 1684926000,
      "temp": 292.01,
      "feels_like": 292.33,
      "pressure": 1014,
      "humidity": 91,
      "dew_point": 290.51,
      "uvi": 0,
      "clouds": 54,
      "visibility": 10000,
      "wind_speed": 2.58,
      "wind_deg": 86,
      "wind_gust": 5.88,
      "weather": [
        {
          "id": 803,
          "main": "Clouds",
          "description": "broken clouds",
          "icon": "04n"
        }
      ],
      "pop": 0.15
    }
    // ... 48 entries (1 per hour)
  ],
  "daily": [
    {
      "dt": 1684951200,
      "sunrise": 1684926645,
      "sunset": 1684977332,
      "moonrise": 1684941060,
      "moonset": 1684905480,
      "moon_phase": 0.16,
      "summary": "Expect a day of partly cloudy with rain",
      "temp": {
        "day": 299.03,
        "min": 290.69,
        "max": 300.35,
        "night": 291.45,
        "eve": 297.51,
        "morn": 292.55
      },
      "feels_like": {
        "day": 299.21,
        "night": 291.37,
        "eve": 297.86,
        "morn": 292.87
      },
      "pressure": 1016,
      "humidity": 59,
      "dew_point": 290.48,
      "wind_speed": 3.98,
      "wind_deg": 76,
      "wind_gust": 8.92,
      "weather": [
        {
          "id": 500,
          "main": "Rain",
          "description": "light rain",
          "icon": "10d"
        }
      ],
      "clouds": 92,
      "pop": 0.47,
      "rain": 0.15,
      "uvi": 9.23
    }
    // ... 8 entries (1 per day)
  ],
  "alerts": [
    {
      "sender_name": "NWS Philadelphia - Mount Holly",
      "event": "Small Craft Advisory",
      "start": 1684952747,
      "end": 1684988747,
      "description": "...SMALL CRAFT ADVISORY REMAINS IN EFFECT FROM 5 PM THIS AFTERNOON TO 3 AM EST FRIDAY...",
      "tags": ["Coastal event"]
    }
  ]
}
```

### Use Cases
- Get current weather conditions
- Get hourly forecast for next 48 hours
- Get daily forecast for next 8 days
- Get weather alerts for location
- Get minutely precipitation forecast

---

## 2. Time Machine (Historical) Endpoint

### Endpoint
```
GET /data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={API_KEY}
```

### Purpose
Retrieve historical weather data for any date/time in the past. Useful for weather analysis, comparisons, and historical context.

### Required Parameters
- `lat` (number): Latitude, decimal (-90 to 90)
- `lon` (number): Longitude, decimal (-180 to 180)
- `dt` (number): Unix timestamp (UTC) for the requested time
- `appid` (string): Your API key

### Optional Parameters
- `units` (string): Units of measurement (`standard`, `metric`, `imperial`)
- `lang` (string): Language code

### Response Structure
```json
{
  "lat": 39.0997,
  "lon": -94.5783,
  "timezone": "America/Chicago",
  "timezone_offset": -21600,
  "data": [
    {
      "dt": 1643803200,
      "sunrise": 1643810400,
      "sunset": 1643846400,
      "temp": 282.21,
      "feels_like": 278.41,
      "pressure": 1016,
      "humidity": 65,
      "dew_point": 275.99,
      "uvi": 2.55,
      "clouds": 40,
      "visibility": 10000,
      "wind_speed": 5.14,
      "wind_deg": 320,
      "weather": [
        {
          "id": 802,
          "main": "Clouds",
          "description": "scattered clouds",
          "icon": "03d"
        }
      ]
    }
  ]
}
```

### Use Cases
- Get weather conditions for a specific past date/time
- Compare current weather to historical data
- Analyze weather patterns over time
- Verify weather conditions for past events

### Limitations
- Historical data availability depends on subscription tier
- Free tier: Limited historical access
- Paid tiers: Extended historical data (varies by plan)

---

## 3. Day Summary Endpoint

### Endpoint
```
GET /data/3.0/onecall/day_summary?lat={lat}&lon={lon}&date={YYYY-MM-DD}&appid={API_KEY}
```

### Purpose
Get aggregated weather statistics for a specific day, including min/max temperatures, precipitation totals, and other daily summaries.

### Required Parameters
- `lat` (number): Latitude, decimal (-90 to 90)
- `lon` (number): Longitude, decimal (-180 to 180)
- `date` (string): Date in YYYY-MM-DD format
- `appid` (string): Your API key

### Optional Parameters
- `units` (string): Units of measurement (`standard`, `metric`, `imperial`)
- `lang` (string): Language code
- `tz` (string): Timezone offset (e.g., `+03:00`, `-05:00`)

### Response Structure
```json
{
  "lat": 39.0997,
  "lon": -94.5783,
  "tz": "+00:00",
  "date": "2020-03-04",
  "units": "metric",
  "cloud_cover": {
    "afternoon": 0
  },
  "humidity": {
    "afternoon": 33
  },
  "precipitation": {
    "total": 0
  },
  "temperature": {
    "min": -1.85,
    "max": 9.35,
    "afternoon": 7.12,
    "night": 1.38,
    "evening": 3.87,
    "morning": -0.44
  },
  "pressure": {
    "afternoon": 1018
  },
  "wind": {
    "max": {
      "speed": 8.7,
      "direction": 90
    }
  }
}
```

### Use Cases
- Get daily weather summary
- Analyze temperature ranges for a day
- Check precipitation totals
- Review wind and pressure patterns

---

## 4. Weather Overview Endpoint

### Endpoint
```
GET /data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API_KEY}
```

### Purpose
Get an AI-generated human-readable weather summary for the location. Provides natural language description of weather conditions.

### Required Parameters
- `lat` (number): Latitude, decimal (-90 to 90)
- `lon` (number): Longitude, decimal (-180 to 180)
- `appid` (string): Your API key

### Optional Parameters
- `date` (string): Date in YYYY-MM-DD format (today or tomorrow)
  - If not specified, defaults to current date
- `units` (string): Units of measurement (`standard`, `metric`, `imperial`)

### Response Structure
```json
{
  "lat": 51.5099,
  "lon": -0.1181,
  "tz": "+01:00",
  "date": "2024-05-13",
  "units": "metric",
  "weather_overview": "The current weather is overcast with a temperature of 16°C and a feels-like temperature of 16°C. The wind speed is 3 m/s coming from the west-southwest direction. The air pressure is at 1010 hPa, and the humidity level is at 72%. The visibility is good at 10 km, and the UV index is moderate at 4. Overall, it's a cloudy day with mild temperatures and moderate wind."
}
```

### Use Cases
- Get human-readable weather description
- Provide conversational weather updates
- Generate weather summaries for reports
- Offer weather advice in natural language

---

## Implementation Strategy

### 1. Client Wrapper Design

Create a `WeatherClient` class that wraps all API endpoints:

```typescript
class WeatherClient {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, CachedResponse>;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  }
  
  async getCurrentAndForecast(lat: number, lon: number, options?: {
    exclude?: string[];
    units?: 'standard' | 'metric' | 'imperial';
    lang?: string;
  }): Promise<CurrentAndForecastResponse> {
    // Implementation
  }
  
  async getHistorical(lat: number, lon: number, timestamp: number, options?: {
    units?: 'standard' | 'metric' | 'imperial';
  }): Promise<HistoricalResponse> {
    // Implementation
  }
  
  async getDaySummary(lat: number, lon: number, date: string, options?: {
    units?: 'standard' | 'metric' | 'imperial';
    tz?: string;
  }): Promise<DaySummaryResponse> {
    // Implementation
  }
  
  async getOverview(lat: number, lon: number, options?: {
    date?: string;
    units?: 'standard' | 'metric' | 'imperial';
  }): Promise<OverviewResponse> {
    // Implementation
  }
}
```

### 2. Response Caching

Implement caching to reduce API calls:

- **Current weather**: Cache for 10 minutes
- **Forecasts**: Cache for 30 minutes
- **Historical data**: Cache for 24 hours (doesn't change)
- **Day summaries**: Cache for 24 hours
- **Overviews**: Cache for 1 hour

### 3. Error Handling

Handle common API errors:

- **401 Unauthorized**: Invalid API key
- **404 Not Found**: Invalid coordinates or date
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: OpenWeatherMap service issue

Implement retry logic with exponential backoff for transient errors.

### 4. Input Validation

Validate all inputs before making API calls:

- Latitude: -90 to 90
- Longitude: -180 to 180
- Date format: YYYY-MM-DD
- Timestamp: Valid Unix timestamp
- Units: One of `standard`, `metric`, `imperial`

---

## MCP Tool Mapping

Map API endpoints to MCP tools:

| MCP Tool | API Endpoint | Purpose |
|----------|--------------|---------|
| `weather_get_current` | `/onecall` (exclude=minutely,hourly,daily,alerts) | Current weather only |
| `weather_get_hourly` | `/onecall` (exclude=minutely,daily,alerts) | Hourly forecast |
| `weather_get_daily` | `/onecall` (exclude=minutely,hourly,alerts) | Daily forecast |
| `weather_get_alerts` | `/onecall` (exclude=minutely,hourly,daily) | Weather alerts |
| `weather_get_historical` | `/onecall/timemachine` | Historical data |
| `weather_get_day_summary` | `/onecall/day_summary` | Daily summary |
| `weather_get_overview` | `/onecall/overview` | AI summary |

---

## Benefits

1. **Comprehensive Coverage**: Access to current, forecast, historical, and summary data
2. **Flexible Querying**: Exclude unnecessary data to reduce response size
3. **Multiple Formats**: Structured JSON and human-readable summaries
4. **Global Coverage**: Works for any location worldwide
5. **Rich Data**: Includes temperature, precipitation, wind, pressure, humidity, UV, alerts

## Trade-offs

1. **Rate Limits**: Free tier limited to 1,000 calls/day
2. **API Costs**: Paid tiers required for higher usage
3. **Historical Limits**: Limited historical data on free tier
4. **Latency**: API calls add 200-500ms latency
5. **Dependency**: Relies on OpenWeatherMap service availability

---

**Status**: Design Specification Complete
**Recommendation**: Proceed with implementation of WeatherClient and MCP tools
**Next Steps**: Create TypeScript types for all API responses
