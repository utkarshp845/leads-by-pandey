import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logInfo, logError } from "@/lib/logger";

// Mark route as dynamic
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Comprehensive health check endpoint
 */
export async function GET() {
  const startTime = Date.now();
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    environment: Record<string, any>;
    database: { status: 'connected' | 'disconnected' | 'error'; latency?: number };
    externalApi: { status: 'available' | 'unavailable' | 'error' };
    uptime: number;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {},
    database: { status: 'disconnected' },
    externalApi: { status: 'unavailable' },
    uptime: process.uptime(),
  };

  // Check environment variables
  health.environment = {
    OPENROUTER_API_KEY: {
      set: !!process.env.OPENROUTER_API_KEY,
      length: process.env.OPENROUTER_API_KEY?.length || 0,
    },
    JWT_SECRET: {
      set: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET?.length || 0,
    },
    SUPABASE_URL: {
      set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    SUPABASE_KEY: {
      set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    NODE_ENV: process.env.NODE_ENV || "not set",
  };

  // Check database connectivity
  try {
    if (supabase) {
      const dbStartTime = Date.now();
      const { error } = await supabase.from('users').select('id').limit(1);
      const dbLatency = Date.now() - dbStartTime;
      
      if (error) {
        health.database = { status: 'error', latency: dbLatency };
        health.status = 'degraded';
        logError('Database health check failed', error);
      } else {
        health.database = { status: 'connected', latency: dbLatency };
      }
    } else {
      health.database = { status: 'disconnected' };
      health.status = 'degraded';
    }
  } catch (error) {
    health.database = { status: 'error' };
    health.status = 'degraded';
    logError('Database health check error', error instanceof Error ? error : new Error(String(error)));
  }

  // Check external API (OpenRouter) availability
  try {
    if (process.env.OPENROUTER_API_KEY) {
      const apiStartTime = Date.now();
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        health.externalApi = { status: 'available' };
      } else {
        health.externalApi = { status: 'unavailable' };
        health.status = health.status === 'healthy' ? 'degraded' : health.status;
      }
    } else {
      health.externalApi = { status: 'unavailable' };
      health.status = 'degraded';
    }
  } catch (error) {
    health.externalApi = { status: 'error' };
    health.status = health.status === 'healthy' ? 'degraded' : health.status;
    logError('External API health check error', error instanceof Error ? error : new Error(String(error)));
  }

  // Determine overall status
  const envSet = health.environment.OPENROUTER_API_KEY.set && 
                 health.environment.JWT_SECRET.set &&
                 health.environment.SUPABASE_URL.set &&
                 health.environment.SUPABASE_KEY.set;

  if (!envSet || health.database.status === 'error' || health.externalApi.status === 'error') {
    health.status = 'unhealthy';
  }

  const duration = Date.now() - startTime;
  logInfo('Health check completed', { status: health.status, duration: `${duration}ms` });

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}

