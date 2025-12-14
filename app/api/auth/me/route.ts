import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { findUserById } from "@/lib/db-supabase";
import { handleError, createError, ErrorType } from "@/lib/error-handler";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or header (prefer header for client-side tokens)
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      throw createError(ErrorType.AUTH_ERROR, "Not authenticated", 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw createError(ErrorType.AUTH_ERROR, "Invalid token", 401);
    }

    // Get user
    const user = await findUserById(decoded.userId);
    if (!user) {
      throw createError(ErrorType.NOT_FOUND, "User not found", 404);
    }

    // Return user without password
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token, // Also return token for client-side use
    });
  } catch (error) {
    return handleError(error);
  }
}

