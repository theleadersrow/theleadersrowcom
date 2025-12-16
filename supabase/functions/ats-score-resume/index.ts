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

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer, career coach, and hiring manager with 15+ years of experience screening resumes for Fortune 500 companies. 

You provide BRUTALLY HONEST assessments that reveal the TRUE reasons why resumes fail to pass ATS systems and why candidates don't get interviews. You don't sugarcoat issues.

Your analysis must identify:
1. EXACT keyword gaps and missing technical skills
2. YEARS OF EXPERIENCE mismatches (if job requires 7+ years but resume shows 4, call it out explicitly)
3. LEADERSHIP/MANAGEMENT gaps (if job requires people management, team leadership, or direct reports and resume lacks this)
4. STRATEGIC vs TACTICAL gaps (if job is senior/director level requiring strategy but resume is all tactical execution)
5. DOMAIN/INDUSTRY experience gaps
6. TECH STACK gaps (specific technologies, tools, platforms missing)
7. SCOPE gaps (individual contributor vs team lead vs manager vs director level work)
8. IMPACT gaps (missing quantified achievements, metrics, business outcomes)

Be direct, specific, and helpful. Focus on concrete improvements that will make a real difference.`;

    const userPrompt = `Analyze this resume against the job description with BRUTAL HONESTY. I need to know the REAL reasons why this resume might not pass ATS or get interviews.

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
  "summary": "<2-3 sentence BRUTALLY HONEST assessment that highlights the biggest gaps>",
  "matched_keywords": ["keyword1", "keyword2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...up to 15 critical missing keywords],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": [
    {"priority": "critical", "issue": "<SPECIFIC gap - e.g. 'Resume shows 4 years experience but role requires 7+ years'>", "fix": "<specific fix>"},
    {"priority": "critical", "issue": "<SPECIFIC gap - e.g. 'No people management experience but role requires managing team of 5+'>", "fix": "<specific fix>"},
    {"priority": "high", "issue": "<SPECIFIC gap>", "fix": "<specific fix>"},
    {"priority": "high", "issue": "<SPECIFIC gap>", "fix": "<specific fix>"},
    {"priority": "medium", "issue": "<SPECIFIC gap>", "fix": "<specific fix>"}
  ],
  "experience_gaps": [
    "<SPECIFIC gap like 'Job requires 8+ years in product management, resume shows ~5 years'>",
    "<SPECIFIC gap like 'No evidence of managing direct reports - role requires 3+ years people management'>",
    "<SPECIFIC gap like 'Missing enterprise/B2B experience - role is for enterprise software'>",
    "<SPECIFIC gap like 'No experience with [specific tech stack from JD]'>",
    "<SPECIFIC gap like 'Resume shows IC work only - role requires director-level strategic leadership'>"
  ],
  "skills_gaps": [
    {"skill": "<missing skill from JD>", "importance": "critical|high|medium", "context": "<why this matters for the role>"},
    {"skill": "<missing skill from JD>", "importance": "critical|high|medium", "context": "<why this matters for the role>"}
  ],
  "years_experience_analysis": {
    "job_requires": "<e.g. '7-10 years' or 'Senior level (typically 6+ years)'>",
    "resume_shows": "<e.g. '4-5 years based on work history'>",
    "gap": "<e.g. '2-3 years short of requirement' or 'Meets requirement'>"
  },
  "leadership_analysis": {
    "job_requires": "<e.g. 'People management of 5+ direct reports' or 'IC role - no management required'>",
    "resume_shows": "<e.g. 'No direct reports mentioned' or 'Managed team of 3'>",
    "gap": "<specific gap or 'Meets requirement'>"
  },
  "tech_stack_gaps": ["<missing technology 1>", "<missing technology 2>"],
  "recommended_additions": ["<addition1>", "<addition2>", "<addition3>"],
  "role_fit_assessment": "<1 paragraph being BRUTALLY HONEST about fit - mention specific years gaps, leadership gaps, skill gaps>",
  "deal_breakers": ["<any absolute deal-breakers that would immediately disqualify this candidate>"]
}

IMPORTANT SCORING GUIDELINES:
- 90-100: Perfect match, exceeds all requirements
- 75-89: Strong match with minor gaps
- 60-74: Decent match but missing key requirements
- 45-59: Significant gaps in experience, skills, or qualifications
- 30-44: Major misalignment with role requirements
- Below 30: Not qualified for this role

Most resumes realistically score 45-70. Don't inflate scores. If there's a 3-year experience gap, that alone should significantly impact the score.`;


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