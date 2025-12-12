import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration - stricter for AI endpoints
const RATE_LIMIT = {
  maxRequests: 10,
  windowMinutes: 60,
};

// Check and update rate limit
async function checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000).toISOString();
  
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart)
    .single();

  if (existing) {
    if (existing.request_count >= RATE_LIMIT.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
    
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.request_count - 1 };
  }
  
  await supabase
    .from("rate_limits")
    .upsert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    }, { onConflict: "identifier,endpoint" });
  
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "ats-score-resume");
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(RATE_LIMIT.windowMinutes * 60),
            ...corsHeaders 
          },
        }
      );
    }
    
    const { resumeText, jobDescription, sessionId } = await req.json();

    // Input validation
    if (!resumeText || typeof resumeText !== "string") {
      return new Response(JSON.stringify({ error: "Resume text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!jobDescription || typeof jobDescription !== "string") {
      return new Response(JSON.stringify({ error: "Job description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Limit input sizes
    const safeResumeText = resumeText.slice(0, 50000);
    const safeJobDescription = jobDescription.slice(0, 20000);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach. 
You analyze resumes against job descriptions to provide actionable feedback.
Be direct, specific, and helpful. Focus on concrete improvements.`;

    const userPrompt = `Analyze this resume against the job description and provide an ATS compatibility score.

**RESUME:**
${safeResumeText}

**JOB DESCRIPTION:**
${safeJobDescription}

Provide your analysis in this exact JSON format (no markdown, just JSON):
{
  "ats_score": <number 0-100>,
  "keyword_match_score": <number 0-100>,
  "experience_match_score": <number 0-100>,
  "skills_match_score": <number 0-100>,
  "format_score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "matched_keywords": ["keyword1", "keyword2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": [
    {"priority": "high", "issue": "<issue>", "fix": "<specific fix>"},
    {"priority": "high", "issue": "<issue>", "fix": "<specific fix>"},
    {"priority": "medium", "issue": "<issue>", "fix": "<specific fix>"}
  ],
  "experience_gaps": ["<gap1>", "<gap2>"],
  "recommended_additions": ["<addition1>", "<addition2>"],
  "role_fit_assessment": "<1 paragraph on how well they fit this specific role>"
}

Be specific and actionable. Score harshly but fairly - most resumes should score 50-75.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI response error:", errorText);
      throw new Error("Failed to analyze resume");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let atsResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        atsResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Error parsing ATS result:", e);
      atsResult = {
        ats_score: 50,
        summary: "Unable to fully analyze. Please try again.",
        matched_keywords: [],
        missing_keywords: [],
        strengths: [],
        improvements: [],
      };
    }

    // Save to assessment session if provided
    if (sessionId) {
      await supabase
        .from("assessment_sessions")
        .update({
          // Store ATS data in the session for later use
        })
        .eq("id", sessionId);
    }

    return new Response(
      JSON.stringify(atsResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ATS scoring error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});