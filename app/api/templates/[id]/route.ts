import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { loadTemplates, updateTemplate, deleteTemplate } from "@/lib/db-supabase";

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

    // Verify template belongs to user
    const templates = await loadTemplates(user.userId);
    const template = templates.find(t => t.id === params.id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.prospectData !== undefined) updates.prospectData = body.prospectData;

    await updateTemplate(params.id, updates);

    const updatedTemplates = await loadTemplates(user.userId);
    const updatedTemplate = updatedTemplates.find(t => t.id === params.id);

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
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

    // Verify template belongs to user
    const templates = await loadTemplates(user.userId);
    const template = templates.find(t => t.id === params.id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await deleteTemplate(params.id);
    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

