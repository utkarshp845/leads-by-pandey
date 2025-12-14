import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { findUserByEmail, loadUsers } from "@/lib/db-supabase";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/login/route.ts:10',message:'Login attempt started',data:{hasEmail:!!email,hasPassword:!!password,emailProvided:email?.substring(0,20)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/login/route.ts:22',message:'Email normalized',data:{originalEmail:email,normalizedEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    // Find user
    const user = await findUserByEmail(normalizedEmail);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/login/route.ts:25',message:'After findUserByEmail',data:{userFound:!!user,userId:user?.id||'none',userEmail:user?.email||'none',hasPasswordHash:!!user?.passwordHash,passwordHashLength:user?.passwordHash?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/login/route.ts:52',message:'Before password verification',data:{passwordLength:password?.length||0,passwordHashLength:user.passwordHash?.length||0,passwordHashPrefix:user.passwordHash?.substring(0,20)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      isValid = await verifyPassword(password, user.passwordHash);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/login/route.ts:54',message:'After password verification',data:{isValid,passwordProvided:password?.substring(0,5)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
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

