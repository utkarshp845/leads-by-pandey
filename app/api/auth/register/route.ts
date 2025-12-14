import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db-supabase";
import { validateEmail, validatePassword, validateName, validateRequestBodySize } from "@/lib/validation";
import { handleError, createError, ErrorType } from "@/lib/error-handler";
import { logUserActivity } from "@/lib/logger";
import { rateLimiters } from "@/lib/rate-limit";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimiters.registration(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // Validate request body size
    const body = await request.json();
    const sizeCheck = validateRequestBodySize(body, 10000); // 10KB max
    if (!sizeCheck.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, sizeCheck.error || "Request too large", 413);
    }

    const { email, name, password } = body;

    // Validation
    if (!email || !name || !password) {
      throw createError(ErrorType.VALIDATION_ERROR, "Email, name, and password are required", 400);
    }

    // Enhanced validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, emailValidation.error || "Invalid email", 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, passwordValidation.error || "Invalid password", 400);
    }

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, nameValidation.error || "Invalid name", 400);
    }

    // Normalize email first
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists (using normalized email)
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw createError(ErrorType.USER_ERROR, "User with this email already exists", 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userWithPassword = await createUser(normalizedEmail, name.trim(), passwordHash);

    // Generate token
    const token = generateToken({
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      createdAt: userWithPassword.createdAt,
    });

    // Log user activity
    logUserActivity(userWithPassword.id, "user_registered", {
      email: userWithPassword.email,
    });

    // Return user (without password) and token
    const response = NextResponse.json(
      {
        user: {
          id: userWithPassword.id,
          email: userWithPassword.email,
          name: userWithPassword.name,
          createdAt: userWithPassword.createdAt,
        },
        token,
      },
      { status: 201 }
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

