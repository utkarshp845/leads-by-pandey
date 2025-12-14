import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadUserSettings, saveUserSettings } from "@/lib/db-supabase";
import { UserSettings } from "@/lib/types";
import { handleError, createError, ErrorType } from "@/lib/error-handler";
import { validateRequestBodySize } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      throw createError(ErrorType.AUTH_ERROR, "Not authenticated", 401);
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
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      throw createError(ErrorType.AUTH_ERROR, "Not authenticated", 401);
    }

    // Validate request body size
    const body = await request.json();
    const sizeCheck = validateRequestBodySize(body, 10000);
    if (!sizeCheck.valid) {
      throw createError(ErrorType.VALIDATION_ERROR, sizeCheck.error || "Request too large", 413);
    }

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
    return handleError(error);
  }
}

