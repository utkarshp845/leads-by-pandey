import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { findUserByEmail, loadUsers } from "@/lib/db-supabase";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      console.log(`ERROR: Login failed: User not found for email: ${normalizedEmail}`);
      console.log(`   Searching for: "${normalizedEmail}"`);
      const allUsers = await loadUsers();
      console.log(`   Available users in database: ${allUsers.length}`);
      if (allUsers.length > 0) {
        console.log(`   User emails: ${allUsers.map(u => `"${u.email}"`).join(", ")}`);
      } else {
        console.log(`   No users found in database - database may be empty or not connected`);
      }
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(`User found: ${user.email} (ID: ${user.id})`);
    console.log(`   Password hash exists: ${!!user.passwordHash}`);
    console.log(`   Password hash length: ${user.passwordHash?.length || 0}`);

    // Verify password
    let isValid: boolean;
    try {
      console.log(`   Verifying password for user: ${user.email}`);
      console.log(`   Password hash exists: ${!!user.passwordHash}`);
      console.log(`   Password hash length: ${user.passwordHash?.length || 0}`);
      isValid = await verifyPassword(password, user.passwordHash);
      console.log(`   Password verification result: ${isValid ? "✅ Valid" : "❌ Invalid"}`);
    } catch (error) {
      console.error("Password verification error:", error);
      return NextResponse.json(
        { error: "Failed to verify password. Please try again." },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.log(`ERROR: Login failed: Invalid password for email: ${normalizedEmail}`);
      console.log(`   User exists but password does not match`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(`Login successful for user: ${user.email}`);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
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

    console.log(`Cookie set for user: ${user.email}`);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle JWT_SECRET configuration errors
    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to login. Please try again." },
      { status: 500 }
    );
  }
}

