import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, UserWithPassword } from "./types";

// In production, this MUST be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-secret-key-change-in-production");
const JWT_EXPIRES_IN = "7d";

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get user from request headers (for API routes)
 */
export function getUserFromRequest(
  authHeader: string | null
): { userId: string; email: string } | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

