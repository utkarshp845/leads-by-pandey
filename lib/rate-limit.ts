/**
 * Rate Limiting Implementation
 * Prevents abuse and DoS attacks
 */

import { NextRequest } from 'next/server';
import { createError, ErrorType } from './error-handler';
import { logWarn } from './logger';
import { verifyToken } from './auth';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for MVP)
// For production scale, use Redis
const rateLimitStore: RateLimitStore = {};

/**
 * Clean up expired entries periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in rateLimitStore) {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    }
  }, 60000); // Clean up every minute
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from auth token first
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth-token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;
  
  if (token) {
    try {
      // Verify token and extract user ID
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        return `user:${decoded.userId}`;
      }
    } catch {
      // Fall through to IP-based limiting
    }
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check rate limit
 */
export function checkRateLimit(
  request: NextRequest,
  limit: number,
  windowMs: number,
  identifier?: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientId = identifier || getClientId(request);
  const now = Date.now();
  const key = clientId;

  // Get or create rate limit entry
  let entry = rateLimitStore[key];

  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore[key] = entry;
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  if (entry.count > limit) {
    logWarn('Rate limit exceeded', { clientId, limit, count: entry.count });
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware factory
 */
export function createRateLimiter(
  limit: number,
  windowMs: number,
  identifier?: (request: NextRequest) => string
) {
  return (request: NextRequest): { allowed: boolean; response?: Response } => {
    const id = identifier ? identifier(request) : undefined;
    const result = checkRateLimit(request, limit, windowMs, id);

    if (!result.allowed) {
      return {
        allowed: false,
        response: new Response(
          JSON.stringify({
            error: 'Too many requests. Please try again later.',
            type: ErrorType.RATE_LIMIT,
            resetTime: result.resetTime,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          }
        ),
      };
    }

    return { allowed: true };
  };
}

/**
 * Predefined rate limiters
 */
export const rateLimiters = {
  // Login: 5 attempts per 15 minutes
  login: createRateLimiter(5, 15 * 60 * 1000),
  
  // Registration: 3 per hour per IP
  registration: createRateLimiter(3, 60 * 60 * 1000),
  
  // Strategy generation: 10 per hour per user
  strategyGeneration: createRateLimiter(10, 60 * 60 * 1000, (req) => {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded && decoded.userId) {
          return `user:${decoded.userId}`;
        }
      } catch {
        // Fall through
      }
    }
    return getClientId(req);
  }),
  
  // General API: 100 per minute per user/IP
  general: createRateLimiter(100, 60 * 1000),
};

