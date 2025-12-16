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
    
    const { resumeText, jobDescription, sessionId, isPostTransformation } = await req.json();

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

    // Use a more OBJECTIVE scoring system focused on measurable keyword/skill matching
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how automated resume screening works.

CRITICAL: You must CAREFULLY READ and EXTRACT specific information from BOTH documents before scoring.

**STEP 1 - EXTRACT FROM JOB DESCRIPTION:**
- Required years of experience (exact numbers)
- Required skills and technologies (list each one)
- Required qualifications and certifications
- Management/leadership requirements
- Industry/domain requirements
- Key responsibilities and deliverables

**STEP 2 - EXTRACT FROM RESUME:**
- Total years of experience (calculate from work history dates)
- All skills and technologies mentioned
- Certifications and qualifications
- Evidence of management/leadership (team sizes, scope)
- Industries and domains worked in
- Quantified achievements and outcomes

**STEP 3 - COMPARE AND SCORE:**
1. KEYWORD MATCHING - Count exact and semantic matches between resume and job description
2. SKILLS ALIGNMENT - Identify required skills present vs missing
3. EXPERIENCE LEVEL - Compare years of experience requirements vs resume evidence
4. LEADERSHIP/SCOPE - Match management requirements to resume evidence
5. TECHNICAL FIT - Match tech stack, tools, and methodologies

SCORING MUST BE OBJECTIVE AND REPRODUCIBLE:
- Base scores on COUNTABLE factors (keywords found, skills matched, years shown)
- A resume with MORE job keywords should ALWAYS score higher than one with fewer
- Don't penalize for format/style if content is strong
- Focus on WHAT IS PRESENT, not subjective judgments about quality`;

    const userPrompt = `CAREFULLY analyze this resume against the job description. Read EVERY section of both documents.

**RESUME (Read carefully - extract all skills, experience, achievements):**
${safeResumeText}

**JOB DESCRIPTION (Read carefully - extract all requirements):**
${safeJobDescription}

${isPostTransformation ? `
**IMPORTANT CONTEXT:** This is a resume that has been optimized for this job. Score it OBJECTIVELY based on keyword matches and content alignment. Compare the actual keywords and skills present to what the job requires.
` : ''}

**BEFORE SCORING, you MUST:**
1. List every required skill/technology from the job description
2. Check if each one appears in the resume (exact or semantic match)
3. Extract the years of experience required vs. what the resume shows
4. Identify leadership/management requirements and evidence

Provide your analysis in this exact JSON format (no markdown, just JSON):
{
  "ats_score": <number 0-100 - calculate as: (keyword_match * 0.35) + (skills_match * 0.25) + (experience_match * 0.25) + (format * 0.15)>,
  "keyword_match_score": <0-100 based on: (matched keywords / total required keywords) * 100>,
  "experience_match_score": <0-100 based on years alignment>,
  "skills_match_score": <0-100 based on skills present vs required>,
  "format_score": <0-100 based on ATS-readable format>,
  "summary": "<2-3 sentence objective assessment citing SPECIFIC matches and gaps found>",
  "matched_keywords": ["keyword1", "keyword2", ...list ALL keywords from JD found in resume - be thorough],
  "missing_keywords": ["keyword1", "keyword2", ...up to 15 important keywords from JD NOT found in resume],
  "strengths": ["strength1", "strength2", "strength3" - cite SPECIFIC content from the resume],
  "improvements": [
    {"priority": "critical|high|medium", "issue": "<specific gap with context>", "fix": "<specific actionable fix>"}
  ],
  "experience_gaps": ["<specific gaps citing what JD requires vs what resume shows>"],
  "skills_gaps": [
    {"skill": "<missing skill from JD>", "importance": "critical|high|medium", "context": "<where it's mentioned in JD and why it matters>"}
  ],
  "years_experience_analysis": {
    "job_requires": "<exact years from JD, e.g., '5+ years in product management'>",
    "resume_shows": "<calculated from resume dates, e.g., '7 years based on roles from 2017-2024'>",
    "gap": "<specific analysis or 'Meets requirement'>"
  },
  "leadership_analysis": {
    "job_requires": "<from JD, e.g., 'Manage team of 5+, cross-functional leadership'>",
    "resume_shows": "<from resume, e.g., 'Led team of 8 engineers, partnered with 3 teams'>",
    "gap": "<specific gap or 'Meets requirement'>"
  },
  "tech_stack_gaps": ["<technologies mentioned in JD but not in resume>"],
  "recommended_additions": ["<specific addition based on JD requirements>"],
  "role_fit_assessment": "<1 paragraph citing SPECIFIC evidence from both documents>",
  "deal_breakers": ["<only true disqualifying factors that cannot be addressed>"]
}

SCORING GUIDELINES (be consistent):
- 85-100: Strong keyword match (>80% of required terms), meets experience requirements
- 70-84: Good match (60-80% keywords), minor gaps
- 55-69: Moderate match (40-60% keywords), some gaps
- 40-54: Weak match (<40% keywords), significant gaps
- Below 40: Poor alignment

CRITICAL: Be thorough in reading BOTH documents. Count actual keyword matches. More matches = higher score. Cite specific evidence.`;

    console.log("ATS Analysis - isPostTransformation:", isPostTransformation);

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