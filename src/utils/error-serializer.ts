/**
 * Error serialization for MCP responses
 */

import { WeatherAPIError, ValidationError, RateLimitError } from '../types.js';

export interface SerializedError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Serialize any error into a consistent format for MCP responses
 */
export function serializeError(error: unknown): SerializedError {
  // Handle WeatherAPIError (includes RateLimitError)
  if (error instanceof WeatherAPIError) {
    return {
      message: error.message,
      code: error.code || 'API_ERROR',
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle ValidationError
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: error.field ? { field: error.field } : undefined,
    };
  }

  // Handle generic Error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Handle non-Error objects
  return {
    message: String(error),
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Check if error is retryable (5xx errors, network errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof WeatherAPIError) {
    // Retry on 5xx server errors
    return error.statusCode !== undefined && error.statusCode >= 500;
  }

  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    );
  }

  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof RateLimitError) {
    return 'Rate limit exceeded. Please try again later or upgrade your OpenWeatherMap plan.';
  }

  if (error instanceof WeatherAPIError) {
    if (error.statusCode === 401) {
      return 'Invalid API key. Please check your OPENWEATHER_API_KEY configuration.';
    }
    if (error.statusCode === 404) {
      return 'Location not found. Please check your coordinates.';
    }
    return error.message;
  }

  if (error instanceof ValidationError) {
    return `Invalid input: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
