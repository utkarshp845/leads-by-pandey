import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadUserProspects, saveUserProspects } from "@/lib/db-supabase";
import { SavedProspect } from "@/lib/types";
import { validateProspect, validateRequestBodySize } from "@/lib/validation";
import { handleError, createError, ErrorType } from "@/lib/error-handler";
import { logUserActivity } from "@/lib/logger";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      throw createError(ErrorType.AUTH_ERROR, "Not authenticated", 401);
    }

    // Load prospects for user
    const prospects = await loadUserProspects(user.userId);
    return NextResponse.json({ prospects });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      throw createError(ErrorType.AUTH_ERROR, "Not authenticated", 401);
    }

    // Validate request body size
    const body = await request.json();
    const sizeCheck = validateRequestBodySize(body, 1000000); // 1MB max
    if (!sizeCheck.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, sizeCheck.error || "Request too large", 413);
    }

    const { prospects } = body;

    if (!Array.isArray(prospects)) {
      throw createError(ErrorType.VALIDATION_ERROR, "Invalid prospects data", 400);
    }

    // Validate each prospect
    for (const prospect of prospects) {
      const validation = validateProspect(prospect);
      if (!validation.valid) {
        throw createError(ErrorType.VALIDATION_ERROR, validation.error || "Invalid prospect data", 400);
      }
      
      // Ensure user owns the prospect
      if (prospect.userId && prospect.userId !== user.userId) {
        throw createError(ErrorType.AUTH_ERROR, "Unauthorized access to prospect", 403);
      }
    }

    // Save prospects for user
    await saveUserProspects(user.userId, prospects as SavedProspect[]);
    
    // Log user activity
    logUserActivity(user.userId, "prospects_saved", {
      count: prospects.length,
    });
    
    return NextResponse.json({ message: "Prospects saved successfully" });
  } catch (error) {
    return handleError(error);
  }
}

