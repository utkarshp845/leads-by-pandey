import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { logUserActivity } from "@/lib/logger";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get user before logging out (for activity logging)
    const user = await getUserFromRequest(request);
    
    const response = NextResponse.json({ message: "Logged out successfully" });
    
    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    // Log user activity if user was authenticated
    if (user) {
      logUserActivity(user.userId, "user_logged_out", {
        email: user.email,
      });
    }

    return response;
  } catch (error) {
    // Even if there's an error, clear the cookie
    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
}

