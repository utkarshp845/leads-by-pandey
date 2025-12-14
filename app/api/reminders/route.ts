import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadReminders, saveReminder } from "@/lib/db-supabase";
import { Reminder } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status");
    const reminders = await loadReminders(user.userId);

    let filteredReminders = reminders;
    if (status) {
      filteredReminders = reminders.filter(r => r.status === status);
    }

    return NextResponse.json({ reminders: filteredReminders });
  } catch (error) {
    console.error("Error loading reminders:", error);
    return NextResponse.json({ error: "Failed to load reminders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, reminderDate, prospectId } = body;

    if (!title || !reminderDate) {
      return NextResponse.json({ error: "Title and reminder date are required" }, { status: 400 });
    }

    const reminder: Omit<Reminder, 'createdAt' | 'updatedAt'> = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.userId,
      prospectId: prospectId || null,
      title: title.trim(),
      description: description?.trim() || undefined,
      reminderDate: new Date(reminderDate).getTime(),
      status: 'pending',
    };

    const savedReminder = await saveReminder(reminder);
    return NextResponse.json({ reminder: savedReminder }, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

