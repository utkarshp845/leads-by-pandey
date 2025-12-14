import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { findUserByEmail } from "@/lib/db-supabase";
import { validateEmail, validateRequestBodySize } from "@/lib/validation";
import { handleError, createError, ErrorType } from "@/lib/error-handler";
import { logUserActivity, logWarn } from "@/lib/logger";
import { rateLimiters } from "@/lib/rate-limit";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimiters.login(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // Validate request body size
    const body = await request.json();
    const sizeCheck = validateRequestBodySize(body, 10000);
    if (!sizeCheck.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, sizeCheck.error || "Request too large", 413);
    }

    const { email, password } = body;

    // Validation
    if (!email || !password) {
      throw createError(ErrorType.VALIDATION_ERROR, "Email and password are required", 400);
    }

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, emailValidation.error || "Invalid email", 400);
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      logWarn("Login attempt failed: user not found", { email: normalizedEmail });
      throw createError(ErrorType.AUTH_ERROR, "Invalid email or password", 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logWarn("Login attempt failed: invalid password", { userId: user.id, email: normalizedEmail });
      throw createError(ErrorType.AUTH_ERROR, "Invalid email or password", 401);
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });

    // Log successful login
    logUserActivity(user.id, "user_logged_in", {
      email: user.email,
    });

    // Return user (without password) and token
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 200 }
    );

    // Set httpOnly cookie for server-side access
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}

