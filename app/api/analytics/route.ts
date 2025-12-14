import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { getAnalytics } from "@/lib/db-supabase";
import { handleError, createError, ErrorType } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      throw createError(ErrorType.AUTH_ERROR, "Not authenticated", 401);
    }

    const analytics = await getAnalytics(user.userId);
    return NextResponse.json({ analytics });
  } catch (error) {
    return handleError(error);
  }
}

