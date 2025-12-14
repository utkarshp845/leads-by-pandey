import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadTemplates, saveTemplate } from "@/lib/db-supabase";
import { Template, Prospect } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const templates = await loadTemplates(user.userId);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error loading templates:", error);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, prospectData } = body;

    if (!name || !prospectData) {
      return NextResponse.json({ error: "Name and prospect data are required" }, { status: 400 });
    }

    const template: Omit<Template, 'createdAt' | 'updatedAt'> = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.userId,
      name: name.trim(),
      prospectData: prospectData as Prospect,
    };

    const savedTemplate = await saveTemplate(template);
    return NextResponse.json({ template: savedTemplate }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

