import { NextRequest, NextResponse } from "next/server";
import { generateStrategy } from "@/lib/openrouter";
import { getUserFromRequest } from "@/lib/auth";
import { Prospect } from "@/lib/types";

// Mark route as dynamic
export const dynamic = "force-dynamic";

/**
 * POST /api/mr-pandey
 * Accepts prospect data and returns a 5-piece lead generation strategy
 */
export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fd2f8a3a-1b88-4937-b497-328be366d44b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/mr-pandey/route.ts:13',message:'POST /api/mr-pandey called',data:{nodeEnv:process.env.NODE_ENV,hasOpenRouterKey:!!process.env.OPENROUTER_API_KEY,openRouterKeyLength:process.env.OPENROUTER_API_KEY?.length||0,allEnvKeys:Object.keys(process.env).filter(k=>k.includes('OPEN')||k.includes('JWT')||k.includes('NODE')).join(',')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." },
        { status: 401 }
      );
    }
    
    const user = getUserFromRequest(authHeader || `Bearer ${token}`);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please log in again." },
        { status: 401 }
      );
    }
    
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
        console.error("ERROR: OpenRouter API Key Error:", error.message);
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

