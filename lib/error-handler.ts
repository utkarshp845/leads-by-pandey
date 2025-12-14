/**
 * Centralized Error Handling
 * Provides secure, user-friendly error responses
 */

import { NextResponse } from 'next/server';
import { logError, logWarn } from './logger';

export enum ErrorType {
  USER_ERROR = 'user_error',
  SYSTEM_ERROR = 'system_error',
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
  VALIDATION_ERROR = 'validation_error',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode: number;
  userMessage: string;
  context?: Record<string, any>;
}

/**
 * Create a user-friendly error
 */
export function createError(
  type: ErrorType,
  message: string,
  statusCode: number = 500,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.statusCode = statusCode;
  error.userMessage = getUserFriendlyMessage(type, message);
  error.context = context;
  return error;
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(type: ErrorType, technicalMessage: string): string {
  switch (type) {
    case ErrorType.USER_ERROR:
      return technicalMessage || 'Invalid request. Please check your input and try again.';
    case ErrorType.VALIDATION_ERROR:
      return technicalMessage || 'Please provide valid information.';
    case ErrorType.AUTH_ERROR:
      return 'Authentication failed. Please check your credentials.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please try again later.';
    case ErrorType.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    case ErrorType.SYSTEM_ERROR:
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse {
  // Log the error with full details
  if (error instanceof Error) {
    const appError = error as AppError;
    if (appError.type) {
      logError(appError.message, error, appError.context);
    } else {
      logError('Unhandled error', error);
    }
  } else {
    logError('Unknown error', new Error(String(error)));
  }

  // Determine error type and status code
  let statusCode = 500;
  let userMessage = 'An unexpected error occurred. Please try again later.';
  let errorType = ErrorType.SYSTEM_ERROR;

  if (error instanceof Error) {
    const appError = error as AppError;
    if (appError.type && appError.statusCode) {
      statusCode = appError.statusCode;
      userMessage = appError.userMessage || getUserFriendlyMessage(appError.type, appError.message);
      errorType = appError.type;
    } else if (error.message.includes('JWT') || error.message.includes('token')) {
      statusCode = 401;
      userMessage = 'Authentication failed. Please log in again.';
      errorType = ErrorType.AUTH_ERROR;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      statusCode = 400;
      userMessage = error.message;
      errorType = ErrorType.VALIDATION_ERROR;
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      userMessage = 'The requested resource was not found.';
      errorType = ErrorType.NOT_FOUND;
    }
  }

  // Return sanitized error response
  return NextResponse.json(
    {
      error: userMessage,
      type: errorType,
      // Only include additional details in development
      ...(process.env.NODE_ENV === 'development' && error instanceof Error
        ? { details: error.message }
        : {}),
    },
    { status: statusCode }
  );
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Retry logic for transient failures
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        const appError = error as AppError;
        if (appError.type === ErrorType.USER_ERROR || appError.type === ErrorType.VALIDATION_ERROR) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        logWarn(`Operation failed, retrying (${attempt}/${maxRetries})`, { error: lastError.message });
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Circuit breaker pattern (simple implementation)
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw createError(
          ErrorType.SYSTEM_ERROR,
          'Service temporarily unavailable',
          503
        );
      }
    }

    try {
      const result = await operation();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'open';
      }

      throw error;
    }
  }
}

export const circuitBreaker = new CircuitBreaker();

