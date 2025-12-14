/**
 * Structured Logging Utility
 * Provides consistent, sanitized logging for production
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Don't log passwords or tokens
    if (data.length > 0 && (data.includes('password') || data.includes('token') || data.includes('secret'))) {
      return '[REDACTED]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      // Redact sensitive fields
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    entry.context = sanitizeData(context);
  }

  if (error) {
    entry.error = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  return entry;
}

/**
 * Log an error
 */
export function logError(message: string, error?: Error, context?: Record<string, any>): void {
  const entry = createLogEntry(LogLevel.ERROR, message, context, error);
  
  if (process.env.NODE_ENV === 'production') {
    // In production, output as JSON for log aggregation
    console.error(JSON.stringify(entry));
  } else {
    // In development, output formatted
    console.error(`[ERROR] ${entry.timestamp} - ${message}`, error || '', context || '');
  }
}

/**
 * Log a warning
 */
export function logWarn(message: string, context?: Record<string, any>): void {
  const entry = createLogEntry(LogLevel.WARN, message, context);
  
  if (process.env.NODE_ENV === 'production') {
    console.warn(JSON.stringify(entry));
  } else {
    console.warn(`[WARN] ${entry.timestamp} - ${message}`, context || '');
  }
}

/**
 * Log info
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  const entry = createLogEntry(LogLevel.INFO, message, context);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    console.log(`[INFO] ${entry.timestamp} - ${message}`, context || '');
  }
}

/**
 * Log debug (only in development)
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    const entry = createLogEntry(LogLevel.DEBUG, message, context);
    console.debug(`[DEBUG] ${entry.timestamp} - ${message}`, context || '');
  }
}

/**
 * Log performance metrics
 */
export function logPerformance(operation: string, duration: number, context?: Record<string, any>): void {
  const entry = createLogEntry(LogLevel.INFO, `Performance: ${operation}`, {
    ...context,
    duration: `${duration}ms`,
  });
  
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    console.log(`[PERF] ${entry.timestamp} - ${operation} took ${duration}ms`, context || '');
  }
}

/**
 * Log user activity (audit trail)
 */
export function logUserActivity(
  userId: string,
  action: string,
  details?: Record<string, any>
): void {
  const entry = createLogEntry(LogLevel.INFO, `User Activity: ${action}`, {
    userId,
    action,
    ...details,
  });
  
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    console.log(`[ACTIVITY] ${entry.timestamp} - User ${userId}: ${action}`, details || '');
  }
}

