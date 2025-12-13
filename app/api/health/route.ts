import { NextResponse } from "next/server";

// Mark route as dynamic
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Health check endpoint that verifies environment variables are set
 * (without exposing actual values)
 */
export async function GET() {
  const envCheck = {
    OPENROUTER_API_KEY: {
      set: !!process.env.OPENROUTER_API_KEY,
      length: process.env.OPENROUTER_API_KEY?.length || 0,
    },
    JWT_SECRET: {
      set: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET?.length || 0,
    },
    NODE_ENV: process.env.NODE_ENV || "not set",
  };

  const allSet = envCheck.OPENROUTER_API_KEY.set && envCheck.JWT_SECRET.set;

  return NextResponse.json(
    {
      status: allSet ? "healthy" : "missing_env_vars",
      environment: envCheck,
      message: allSet
        ? "All required environment variables are set"
        : "Some required environment variables are missing",
    },
    { status: allSet ? 200 : 503 }
  );
}

