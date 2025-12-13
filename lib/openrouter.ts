import { Prospect, StrategyResponse, OpenRouterResponse, OpenRouterError } from "./types";

/**
 * OpenRouter API configuration
 * Change the model here to use a different AI model
 * Using a free model for MVP
 * 
 * Alternative free models if this doesn't work:
 * - "mistralai/mixtral-8x7b-instruct"
 * - "google/gemma-2-2b-it:free"
 * - "microsoft/phi-3-mini-128k-instruct:free"
 * - "meta-llama/llama-3-8b-instruct"
 */
const OPENROUTER_MODEL = "mistralai/mixtral-8x7b-instruct";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * System prompt for Mr. Pandey persona
 * Encodes the fatherly, steady, business-literal mentor personality
 */
const SYSTEM_PROMPT = `You are Mr. Pandey, a calm, fatherly, business-savvy mentor who has been through hell and back and still has a smile on your face.

Your role is to assist sales professionals in developing lead generation strategies. You are steady, encouraging, and focused on forward momentum.

Your communication style:
- Business-literal, not poetic
- Warm but concise
- No fluff, no exaggerated enthusiasm
- Respect the user's autonomy - you help, you don't replace
- Avoid sounding preachy or condescending

Your philosophy:
- AI assists but does not overshadow the human
- The user's voice matters more than yours
- You provide structure, insight, and next steps
- You never write a full final email - you give a structure/outline so the user can add their own words
- You give clear starting points and options, but never claim "I'll handle everything for you"

PSYCHOLOGY-AWARE STRATEGY DEVELOPMENT:
You understand human psychology in sales contexts. When crafting strategies, consider:
- Decision-making psychology: People make decisions based on emotion, then justify with logic
- Social proof and authority: Prospects respond to credibility and peer validation
- Loss aversion: People fear losing what they have more than gaining something new
- Reciprocity: Giving value first creates obligation
- Commitment and consistency: People want to act consistently with their stated beliefs
- Scarcity: Limited availability creates urgency
- Framing: How you present information affects perception

When providing strategy:
- Be practical, actionable, and respectful of the user's expertise
- Focus on what will actually move the needle with real prospects
- Consider the psychological triggers that will resonate with this specific prospect
- Provide insights that demonstrate deep understanding of human behavior in sales contexts
- Make every piece of advice deliberate and valuable - no generic fluff

CRITICAL: When asked to provide a strategy, you MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations - just pure JSON. All text values must be clean, professional prose without quotes, brackets, or formatting artifacts.`;

/**
 * Builds the user prompt requesting a 5-part strategy for the prospect
 */
function buildUserPrompt(prospect: Prospect): string {
  return `Analyze this prospect using psychological principles and provide a 5-piece lead generation strategy that a sales professional can immediately act on. You MUST respond with ONLY a valid JSON object, no other text.

Prospect Information:
- Name: ${prospect.name}
- Title: ${prospect.title}
- Company: ${prospect.company}
- Industry: ${prospect.industry}
${prospect.knownPainPoints ? `- Known Pain Points: ${prospect.knownPainPoints}` : ""}
${prospect.notes ? `- Notes: ${prospect.notes}` : ""}
${prospect.priorInteractions ? `- Prior Interactions: ${prospect.priorInteractions}` : ""}
${prospect.links.length > 0 ? `- Links: ${prospect.links.join(", ")}` : ""}

You must respond with a JSON object in this exact format. Each field should contain clean, professional prose without quotes, brackets, or formatting artifacts:

{
  "prospectSummary": "Write a concise, valuable summary that helps the salesperson understand who this prospect is, their likely priorities, decision-making context, and what makes them tick. Focus on insights that inform strategy, not just facts. Consider their role, company context, and psychological drivers.",
  "painPointHypothesis": "Based on psychological principles and the prospect's situation, identify their likely pain points. Consider loss aversion, status concerns, efficiency needs, and emotional drivers. Be specific and actionable - what problems keep them up at night? What are they trying to avoid or achieve?",
  "positioningStrategy": "How should the salesperson position their solution to resonate psychologically with this prospect? Consider authority, social proof, reciprocity, and how to frame value in terms that matter to THIS person. What psychological triggers will be most effective?",
  "toneSuggestions": "Recommend the communication tone and approach that will build trust and rapport with this specific prospect. Consider their role, industry, and likely communication preferences. What psychological approach will make them most receptive?",
  "firstMessageStructure": "Provide a clear structure/outline for the first message. Use bullet points for sections like: Opener (how to grab attention psychologically), Context (why this matters to them), Value (framed in terms they care about), CTA (designed to get commitment). Do NOT write the full message - just provide the strategic structure."
}

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object, no markdown code blocks, no explanations, no additional text
- All text values must be clean prose without surrounding quotes, brackets, or escape characters
- Write as if speaking directly to a sales professional - be deliberate, valuable, and actionable
- Apply psychological principles thoughtfully - show you understand human behavior in sales contexts
- Every insight should be specific to THIS prospect, not generic advice`;

}

/**
 * Parses the AI response to extract the strategy
 * Handles both pure JSON and text-wrapped JSON responses
 */
function parseStrategyResponse(content: string): StrategyResponse {
  // Log the raw content for debugging (remove in production if needed)
  console.log("Raw AI response:", content.substring(0, 500));
  
  // Try to extract JSON from the response
  let jsonStr = content.trim();
  
  // Remove markdown code blocks if present
  jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  
  // Try to find JSON object in the text (more robust matching)
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }
  
  try {
    const parsed = JSON.parse(jsonStr);
    
    // Validate required fields
    if (
      typeof parsed.prospectSummary === "string" &&
      typeof parsed.painPointHypothesis === "string" &&
      typeof parsed.positioningStrategy === "string" &&
      typeof parsed.toneSuggestions === "string" &&
      typeof parsed.firstMessageStructure === "string"
    ) {
      return parsed as StrategyResponse;
    }
    
    // Log what we got for debugging
    console.error("Missing required fields. Got:", Object.keys(parsed));
    throw new Error("Missing required fields in response");
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Attempted to parse:", jsonStr.substring(0, 200));
    // Fallback: try to parse labeled sections
    const fallbackResult = parseLabeledSections(content);
    console.log("Using fallback parser result:", Object.keys(fallbackResult));
    return fallbackResult;
  }
}

/**
 * Fallback parser for labeled sections if JSON parsing fails
 */
function parseLabeledSections(content: string): StrategyResponse {
  const sections: Partial<StrategyResponse> = {};
  
  // More flexible patterns that handle various formats
  const patterns = {
    prospectSummary: /(?:Prospect Summary|Summary):?\s*([\s\S]*?)(?=(?:Pain Point Hypothesis|Pain Points|Hypothesis):|$)/i,
    painPointHypothesis: /(?:Pain Point Hypothesis|Pain Points|Hypothesis):?\s*([\s\S]*?)(?=(?:Positioning Strategy|Positioning|Strategy):|$)/i,
    positioningStrategy: /(?:Positioning Strategy|Positioning|Strategy):?\s*([\s\S]*?)(?=(?:Communication Tone Suggestions|Tone Suggestions|Tone|Communication):|$)/i,
    toneSuggestions: /(?:Communication Tone Suggestions|Tone Suggestions|Tone|Communication):?\s*([\s\S]*?)(?=(?:First Message Structure|Message Structure|First Message|Structure):|$)/i,
    firstMessageStructure: /(?:First Message Structure|Message Structure|First Message|Structure):?\s*([\s\S]*?)$/i,
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim();
      if (value.length > 0) {
        sections[key as keyof StrategyResponse] = value;
      }
    }
  }
  
  // If we found at least one section, use what we have, otherwise return error messages
  const hasAnyContent = Object.values(sections).some(v => v && v.length > 0);
  
  if (!hasAnyContent) {
    // Log the content to help debug
    console.error("Could not parse any sections from response. Content preview:", content.substring(0, 500));
  }
  
  // Ensure all fields are present
  return {
    prospectSummary: sections.prospectSummary || "Unable to generate summary.",
    painPointHypothesis: sections.painPointHypothesis || "Unable to generate hypothesis.",
    positioningStrategy: sections.positioningStrategy || "Unable to generate strategy.",
    toneSuggestions: sections.toneSuggestions || "Unable to generate tone suggestions.",
    firstMessageStructure: sections.firstMessageStructure || "Unable to generate message structure.",
  };
}

/**
 * Generates a lead generation strategy for a prospect using OpenRouter API
 * @param prospect - The prospect data
 * @returns Promise resolving to the 5-piece strategy
 * @throws Error if API key is missing or API call fails
 */
export async function generateStrategy(
  prospect: Prospect
): Promise<StrategyResponse> {
  // Check environment variable - try multiple ways to access it
  const apiKey = process.env.OPENROUTER_API_KEY || 
                 process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
                 (typeof process !== 'undefined' && (process as any).env?.OPENROUTER_API_KEY);
  
  // Debug logging (without exposing the key)
  console.log("Environment check:");
  console.log("  - OPENROUTER_API_KEY exists:", !!process.env.OPENROUTER_API_KEY);
  console.log("  - OPENROUTER_API_KEY length:", process.env.OPENROUTER_API_KEY?.length || 0);
  console.log("  - NODE_ENV:", process.env.NODE_ENV);
  console.log("  - All env keys:", Object.keys(process.env).filter(k => k.includes('OPENROUTER') || k.includes('JWT')));
  
  if (!apiKey || apiKey.trim() === "") {
    const errorMsg = "OPENROUTER_API_KEY is not set. Please add it to your environment variables in AWS Amplify Console. Get your API key at https://openrouter.ai/keys";
    console.error("❌ OPENROUTER_API_KEY is not set!");
    console.error("   Environment variables available:", Object.keys(process.env).filter(k => k.includes('OPEN') || k.includes('JWT')));
    console.error("   Please set OPENROUTER_API_KEY in AWS Amplify Console → App settings → Environment variables");
    throw new Error(errorMsg);
  }
  
  console.log("✓ OPENROUTER_API_KEY is set (length: " + apiKey.length + ")");
  
  const userPrompt = buildUserPrompt(prospect);
  
  const requestBody = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3, // Lower temperature for more consistent JSON output
    max_tokens: 2000,
    // Some models support response_format, but not all free models do
    // response_format: { type: "json_object" }
  };
  
  try {
    // Add timeout for production
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData: OpenRouterError = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` },
      }));
      
      throw new Error(
        errorData.error?.message || `API request failed with status ${response.status}`
      );
    }
    
    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from AI model");
    }
    
    const content = data.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI model");
    }
    
    return parseStrategyResponse(content);
  } catch (error) {
    if (error instanceof Error) {
      // Handle timeout
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error(
          "Request timed out. The AI service may be slow. Please try again."
        );
      }
      
      // Handle network errors
      if (error.message.includes("fetch") || error.message.includes("network")) {
        throw new Error(
          "Failed to connect to AI service. Please check your internet connection and try again."
        );
      }
      
      throw error;
    }
    throw new Error("An unexpected error occurred while generating strategy");
  }
}

