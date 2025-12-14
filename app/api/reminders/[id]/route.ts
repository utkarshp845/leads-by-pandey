import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadReminders, updateReminder, deleteReminder } from "@/lib/db-supabase";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify reminder belongs to user
    const reminders = await loadReminders(user.userId);
    const reminder = reminders.find(r => r.id === params.id);
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.reminderDate !== undefined) updates.reminderDate = new Date(body.reminderDate).getTime();
    if (body.status !== undefined) updates.status = body.status;

    await updateReminder(params.id, updates);

    const updatedReminders = await loadReminders(user.userId);
    const updatedReminder = updatedReminders.find(r => r.id === params.id);

    return NextResponse.json({ reminder: updatedReminder });
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify reminder belongs to user
    const reminders = await loadReminders(user.userId);
    const reminder = reminders.find(r => r.id === params.id);
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    await deleteReminder(params.id);
    return NextResponse.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}

