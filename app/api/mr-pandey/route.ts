import { NextRequest, NextResponse } from "next/server";
import { generateStrategy } from "@/lib/openrouter";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { Prospect } from "@/lib/types";
import { validateProspect, validateRequestBodySize, sanitizeText, validateUrl } from "@/lib/validation";
import { handleError, createError, ErrorType } from "@/lib/error-handler";
import { logUserActivity, logPerformance } from "@/lib/logger";
import { rateLimiters } from "@/lib/rate-limit";

// Mark route as dynamic
export const dynamic = "force-dynamic";

/**
 * POST /api/mr-pandey
 * Accepts prospect data and returns a 5-piece lead generation strategy
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication first (needed for user-based rate limiting)
    const user = await getUserFromRequest(request);
    if (!user) {
      throw createError(ErrorType.AUTH_ERROR, "Authentication required. Please log in again.", 401);
    }

    // Apply rate limiting (user-based)
    const rateLimitResult = rateLimiters.strategyGeneration(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }
    
    // Validate request body size
    const body = await request.json();
    const sizeCheck = validateRequestBodySize(body, 50000); // 50KB max for strategy generation
    if (!sizeCheck.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, sizeCheck.error || "Request too large", 413);
    }
    
    // Validate and sanitize prospect data
    const prospect: Prospect = {
      name: sanitizeText(body.name || "", 200).trim(),
      title: sanitizeText(body.title || "", 200).trim(),
      company: sanitizeText(body.company || "", 200).trim(),
      industry: sanitizeText(body.industry || "", 100).trim(),
      notes: sanitizeText(body.notes || "", 10000).trim(),
      knownPainPoints: sanitizeText(body.knownPainPoints || "", 5000).trim(),
      links: Array.isArray(body.links) 
        ? body.links
            .map((link: any) => {
              const urlValidation = validateUrl(String(link));
              return urlValidation.valid && urlValidation.sanitized ? urlValidation.sanitized : null;
            })
            .filter((link: string | null): link is string => link !== null)
            .slice(0, 20) // Limit to 20 links
        : [],
      priorInteractions: sanitizeText(body.priorInteractions || "", 5000).trim(),
    };
    
    // Validate prospect data
    const validation = validateProspect(prospect);
    if (!validation.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, validation.error || "Invalid prospect data", 400);
    }
    
    // Generate strategy using OpenRouter
    const strategy = await generateStrategy(prospect);
    
    // Log performance
    const duration = Date.now() - startTime;
    logPerformance("strategy_generation", duration, { userId: user.userId });
    
    // Log user activity
    logUserActivity(user.userId, "strategy_generated", {
      prospectName: prospect.name,
      prospectCompany: prospect.company,
    });
    
    return NextResponse.json(strategy, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

