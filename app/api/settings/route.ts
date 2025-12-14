import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadUserSettings, saveUserSettings } from "@/lib/db-supabase";
import { UserSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const settings = await loadUserSettings(user.userId);
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          userId: user.userId,
          notificationPreferences: {
            emailEnabled: true,
            emailFrequency: 'daily',
            strategyUpdates: true,
            reminderNotifications: true,
            weeklySummary: true,
          },
          aiPreferences: {
            model: 'openrouter/auto',
          },
          exportDefaultFormat: 'json',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error loading settings:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<UserSettings> = {};

    if (body.notificationPreferences) {
      updates.notificationPreferences = body.notificationPreferences;
    }
    if (body.aiPreferences) {
      updates.aiPreferences = body.aiPreferences;
    }
    if (body.exportDefaultFormat) {
      updates.exportDefaultFormat = body.exportDefaultFormat;
    }

    await saveUserSettings(user.userId, updates);

    const updatedSettings = await loadUserSettings(user.userId);
    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

