import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { loadUserProspects, saveUserProspects } from "@/lib/db";
import { SavedProspect } from "@/lib/types";

// Mark route as dynamic to allow cookie access
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header or cookie
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = getUserFromRequest(authHeader || `Bearer ${token}`);

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Load prospects for user
    const prospects = loadUserProspects(user.userId);
    return NextResponse.json({ prospects });
  } catch (error) {
    console.error("Error loading prospects:", error);
    return NextResponse.json(
      { error: "Failed to load prospects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header or cookie
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = getUserFromRequest(authHeader || `Bearer ${token}`);

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prospects } = body;

    if (!Array.isArray(prospects)) {
      return NextResponse.json(
        { error: "Invalid prospects data" },
        { status: 400 }
      );
    }

    // Save prospects for user
    saveUserProspects(user.userId, prospects as SavedProspect[]);
    return NextResponse.json({ message: "Prospects saved successfully" });
  } catch (error) {
    console.error("Error saving prospects:", error);
    return NextResponse.json(
      { error: "Failed to save prospects" },
      { status: 500 }
    );
  }
}

