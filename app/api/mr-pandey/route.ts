import { NextRequest, NextResponse } from "next/server";
import { generateStrategy } from "@/lib/openrouter";
import { Prospect } from "@/lib/types";

// Mark route as dynamic
export const dynamic = "force-dynamic";

/**
 * POST /api/mr-pandey
 * Accepts prospect data and returns a 5-piece lead generation strategy
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (basic - can be enhanced with Redis in production)
    // For now, we'll rely on OpenRouter's rate limiting
    
    const body = await request.json();
    
    // Validate required fields
    const prospect: Prospect = {
      name: (body.name || "").trim(),
      title: (body.title || "").trim(),
      company: (body.company || "").trim(),
      industry: (body.industry || "").trim(),
      notes: (body.notes || "").trim(),
      knownPainPoints: (body.knownPainPoints || "").trim(),
      links: Array.isArray(body.links) 
        ? body.links.map((link: any) => String(link).trim()).filter((link: string) => link.length > 0)
        : [],
      priorInteractions: (body.priorInteractions || "").trim(),
    };
    
    // Basic validation - at least name and company should be provided
    if (!prospect.name || !prospect.company) {
      return NextResponse.json(
        { error: "Name and company are required fields" },
        { status: 400 }
      );
    }

    // Sanitize input length (prevent abuse)
    if (prospect.name.length > 200 || prospect.company.length > 200) {
      return NextResponse.json(
        { error: "Name and company must be less than 200 characters" },
        { status: 400 }
      );
    }
    
    // Generate strategy using OpenRouter
    const strategy = await generateStrategy(prospect);
    
    // Log if we got fallback values (for debugging)
    if (strategy.prospectSummary.includes("Unable to generate")) {
      console.warn("Warning: Strategy parsing may have failed. Check logs above for raw response.");
    }
    
    return NextResponse.json(strategy, { status: 200 });
  } catch (error) {
    console.error("Error generating strategy:", error);
    
    // Return user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes("OPENROUTER_API_KEY")) {
        console.error("❌ OpenRouter API Key Error:", error.message);
        return NextResponse.json(
          { 
            error: "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your environment variables. Get your API key at https://openrouter.ai/keys",
            details: process.env.NODE_ENV !== "production" ? error.message : undefined
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Failed to generate strategy. Please try again." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

