import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { findUserById } from "./db-supabase";

/**
 * Get user from request (header or cookie)
 */
export async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const user = await findUserById(decoded.userId);
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
  };
}

