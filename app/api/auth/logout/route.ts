import { NextResponse } from "next/server";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  
  // Clear the auth cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

