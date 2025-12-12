import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { findUserById } from "@/lib/db";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or header (prefer header for client-side tokens)
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      console.log("ERROR: /api/auth/me: No token found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("ERROR: /api/auth/me: Invalid token");
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user
    const user = findUserById(decoded.userId);
    if (!user) {
      console.log(`ERROR: /api/auth/me: User not found for ID: ${decoded.userId}`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`/api/auth/me: Authenticated user: ${user.email}`);

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
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Failed to verify authentication" },
      { status: 500 }
    );
  }
}

