/**
 * Error serialization for MCP responses
 */

export interface SerializedError {
  message: string;
  code?: string;
  details?: any;
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: String(error),
    code: 'UNKNOWN_ERROR',
  };
}

// TODO: Add comprehensive error handling
// This will be implemented in Task 12
