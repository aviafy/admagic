/**
 * Error handling utilities
 * Provides consistent error handling across the application
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Parse and normalize errors from various sources
 */
export function parseError(error: unknown): AppError {
  // Handle AppError objects
  if (isAppError(error)) {
    return error;
  }

  // Handle Error instances
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      code: (error as any).code,
    };
  }

  // Handle fetch/network errors
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.message) {
      return {
        message: err.message,
        code: err.code,
        statusCode: err.status || err.statusCode,
      };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Fallback
  return { message: 'An unexpected error occurred' };
}

/**
 * Type guard for AppError
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = parseError(error);

  // Map common errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    'Network request failed': 'Unable to connect. Please check your internet connection.',
    'Failed to fetch': 'Unable to connect to the server. Please try again.',
    'ECONNREFUSED': 'Server is unavailable. Please try again later.',
    'ETIMEDOUT': 'Request timed out. Please try again.',
    'AbortError': 'Request was cancelled. Please try again.',
    'Invalid login credentials': 'Invalid email or password.',
    'Email not confirmed': 'Please verify your email before signing in.',
    'User already registered': 'An account with this email already exists.',
  };

  // Check for exact matches
  if (errorMessages[appError.message]) {
    return errorMessages[appError.message];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMessages)) {
    if (appError.message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return original message if no mapping found
  return appError.message;
}

/**
 * Log error for debugging (in development) or error tracking (in production)
 */
export function logError(error: unknown, context?: string): void {
  const appError = parseError(error);

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, appError);
  } else {
    // In production, you would send to error tracking service
    // Example: Sentry.captureException(error, { extra: { context } });
    console.error('Error occurred:', appError.message);
  }
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  code = 'VALIDATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  code = 'NETWORK_ERROR';
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  code = 'AUTH_ERROR';
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class TimeoutError extends Error {
  code = 'TIMEOUT_ERROR';
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}
