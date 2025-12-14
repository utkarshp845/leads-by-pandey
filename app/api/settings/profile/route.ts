import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadUsers, saveUsers } from "@/lib/db-supabase";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name && !email) {
      return NextResponse.json({ error: "Name or email required" }, { status: 400 });
    }

    const users = await loadUsers();
    const currentUser = users.find(u => u.id === user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check email uniqueness if email is being changed
    if (email && email !== currentUser.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const emailExists = users.some(u => u.email === normalizedEmail && u.id !== user.userId);
      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      currentUser.email = normalizedEmail;
    }

    if (name) {
      currentUser.name = name.trim();
    }

    await saveUsers(users);

    return NextResponse.json({
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        createdAt: currentUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

