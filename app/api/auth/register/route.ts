import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Normalize email first
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists (using normalized email)
    if (findUserByEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
      console.log("Password hashed successfully");
    } catch (error) {
      console.error("Password hashing error:", error);
      throw new Error("Failed to process password");
    }

    let userWithPassword: ReturnType<typeof createUser>;
    try {
      userWithPassword = createUser(normalizedEmail, name.trim(), passwordHash);
      console.log(`User created in database: ${userWithPassword.email} (ID: ${userWithPassword.id})`);
    } catch (error) {
      console.error("User creation error:", error);
      if (error instanceof Error && error.message.includes("already exists")) {
        throw error;
      }
      throw new Error("Failed to create user account");
    }

    // Generate token
    let token: string;
    try {
      token = generateToken({
        id: userWithPassword.id,
        email: userWithPassword.email,
        name: userWithPassword.name,
        createdAt: userWithPassword.createdAt,
      });
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      // If token generation fails, still create the user but return error
      throw tokenError;
    }

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

    // Set httpOnly cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    // Handle JWT_SECRET configuration errors
    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      console.error("JWT_SECRET configuration error:", error.message);
      return NextResponse.json(
        { 
          error: "Server configuration error. JWT_SECRET is not set. Please configure it in your environment variables.",
          details: process.env.NODE_ENV !== "production" ? error.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

