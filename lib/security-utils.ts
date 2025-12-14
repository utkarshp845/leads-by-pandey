/**
 * Security Utility Functions
 * Helper functions for security-related operations
 */

/**
 * Mask sensitive data in strings
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return '*'.repeat(data.length || 8);
  }
  
  const visible = data.slice(0, visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  return visible + masked;
}

/**
 * Check if a string contains potentially malicious content
 */
export function containsMaliciousContent(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\s*\(/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Generate a secure random string
 */
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  return Array.from(randomValues)
    .map(x => chars[x % chars.length])
    .join('');
}

/**
 * Validate CSRF token (basic implementation)
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  // In a real implementation, you'd use a proper CSRF token validation library
  // This is a simplified version
  return token === sessionToken && token.length >= 32;
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  // In production, check against allowed origins
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.includes(origin);
  }

  // In development, allow localhost
  return origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin);
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/\//g, '_');
  sanitized = sanitized.replace(/\\/g, '_');
  
  // Remove special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  sanitized = sanitized.slice(0, 255);
  
  return sanitized || 'file';
}

/**
 * Check request timeout
 */
export function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

/**
 * Race a promise against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs),
  ]);
}

