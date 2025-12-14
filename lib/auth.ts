import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, UserWithPassword } from "./types";

// In production, this MUST be set via environment variable
// For development, use a default secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production-do-not-use-in-production";
const JWT_EXPIRES_IN = "7d";

// Warn if using default secret in production
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("WARNING: JWT_SECRET is not set in production! Authentication will fail.");
}

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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:25',message:'verifyPassword called',data:{passwordLength:password?.length||0,hashLength:hash?.length||0,hashPrefix:hash?.substring(0,30)||'none',hashStartsWithDollar:hash?.startsWith('$')||false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  const result = await bcrypt.compare(password, hash);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:30',message:'bcrypt.compare result',data:{result,passwordProvided:password?.substring(0,5)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  return result;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  if (!JWT_SECRET || JWT_SECRET === "") {
    const errorMsg = process.env.NODE_ENV === "production" 
      ? "JWT_SECRET environment variable is not set. Please configure it in your deployment settings."
      : "JWT_SECRET is not configured. Please set it in your .env file.";
    throw new Error(errorMsg);
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

