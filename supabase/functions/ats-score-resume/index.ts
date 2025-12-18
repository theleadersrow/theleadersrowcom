import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration - tuned for interactive use
const RATE_LIMIT = {
  maxRequests: 30,
  windowMinutes: 30,
};

// Verify tool access by email or access token
async function verifyToolAccess(
  email: string | undefined,
  accessToken: string | undefined,
  toolType: string
): Promise<{ valid: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // If access token provided, verify it
  if (accessToken) {
    const { data: purchase, error } = await supabase
      .from("tool_purchases")
      .select("*")
      .eq("access_token", accessToken)
      .eq("tool_type", toolType)
      .eq("status", "active")
      .maybeSingle();

    if (error || !purchase) {
      return { valid: false, error: "Invalid access token" };
    }

    if (new Date(purchase.expires_at) < new Date()) {
      return { valid: false, error: "Access has expired" };
    }

    // Update usage tracking
    await supabase
      .from("tool_purchases")
      .update({
        usage_count: (purchase.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    return { valid: true };
  }

  // If email provided, verify via email
  if (email) {
    const { data: purchase, error } = await supabase
      .from("tool_purchases")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("tool_type", toolType)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !purchase) {
      return { valid: false, error: "No active access found for this email" };
    }

    // Update usage tracking
    await supabase
      .from("tool_purchases")
      .update({
        usage_count: (purchase.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    return { valid: true };
  }

  return { valid: false, error: "Email or access token required" };
}

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
};

// Check and update rate limit
async function checkRateLimit(identifier: string, endpoint: string): Promise<RateLimitResult> {
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
    .maybeSingle();

  if (existing) {
    if (existing.request_count >= RATE_LIMIT.maxRequests) {
      const windowEndMs = new Date(existing.window_start).getTime() + RATE_LIMIT.windowMinutes * 60 * 1000;
      const retryAfterSec = Math.max(5, Math.ceil((windowEndMs - Date.now()) / 1000));
      return { allowed: false, remaining: 0, retryAfterSec };
    }

    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);

    return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.request_count - 1 };
  }

  await supabase
    .from("rate_limits")
    .upsert(
      {
        identifier,
        endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
      },
      { onConflict: "identifier,endpoint" }
    );

  return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
}

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { resumeText, jobDescription, sessionId, isPostTransformation, email, accessToken } = body || {};

    // Verify tool access
    const accessCheck = await verifyToolAccess(email, accessToken, "resume_suite");
    if (!accessCheck.valid) {
      console.log("Access denied:", accessCheck.error);
      return new Response(JSON.stringify({ error: accessCheck.error || "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit AFTER verifying access (to avoid blocking valid users due to random traffic)
    const rateLimitId = accessToken
      ? `token:${accessToken}`
      : email
        ? `email:${String(email).toLowerCase()}`
        : `ip:${clientIP}`;

    const rateLimit = await checkRateLimit(rateLimitId, "ats-score-resume");
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", rateLimitId);
      const retryAfter = rateLimit.retryAfterSec ?? RATE_LIMIT.windowMinutes * 60;
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          error_type: "rate_limited",
          retry_after_seconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            ...corsHeaders,
          },
        }
      );
    }

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

    // Enhanced Jobscan-style OBJECTIVE scoring system with comprehensive analysis
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how automated resume screening works, inspired by industry-leading tools like Jobscan.

CRITICAL: You must CAREFULLY READ and EXTRACT specific information from BOTH documents before scoring.

**STEP 1 - EXTRACT FROM JOB DESCRIPTION:**
- Required years of experience (exact numbers)
- HARD SKILLS: Technical skills, tools, software, certifications, methodologies (e.g., Python, AWS, Scrum, Six Sigma)
- SOFT SKILLS: Interpersonal and leadership skills (e.g., communication, collaboration, problem-solving, leadership)
- Required qualifications and certifications
- Management/leadership requirements
- Industry/domain requirements
- Key responsibilities and deliverables
- Target job title (exact title from the posting)

**STEP 2 - EXTRACT FROM RESUME:**
- Total years of experience (calculate from work history dates)
- All HARD SKILLS and SOFT SKILLS mentioned (categorize them)
- Certifications and qualifications
- Evidence of management/leadership (team sizes, scope)
- Industries and domains worked in
- Quantified achievements and outcomes (count them!)
- Current/most recent job title
- Contact information completeness

**STEP 3 - ANALYZE FORMATTING (ATS-KILLING ISSUES):**
Check for formatting elements that commonly break ATS parsing:
- Tables or multi-column layouts (ATS often can't parse columns correctly)
- Text boxes or graphics (invisible to ATS)
- Headers/footers (often skipped by ATS)
- Non-standard fonts or special characters
- Images or logos embedded in text
- Unusual section headers that ATS may not recognize
- Missing standard sections (Summary, Experience, Education, Skills)

**STEP 4 - KEYWORD FORMAT ANALYSIS:**
Check if resume uses BOTH acronym and full-form versions of key terms:
- Good: "Search Engine Optimization (SEO)" - ATS can match either
- Bad: Only "SEO" without context - may miss keyword match

**STEP 5 - MEASURABLE RESULTS ANALYSIS:**
Count and analyze quantified achievements:
- Percentages (increased sales by 25%)
- Dollar amounts (managed $2M budget)
- Time savings (reduced processing time by 3 hours)
- Team/scope sizes (led team of 12)
- Counts (launched 5 products)

**STEP 6 - RESUME QUALITY METRICS:**
- Word count (ideal: 400-800 words for 1-page, 600-1000 for 2-page)
- Bullet point analysis (ideal: 3-6 bullets per role, starting with action verbs)
- Sentence length (avoid overly long bullets >25 words)
- Section completeness (Contact, Summary, Experience, Skills, Education)

SCORING MUST BE OBJECTIVE AND REPRODUCIBLE:
- Base scores on COUNTABLE factors (keywords found, skills matched, years shown)
- A resume with MORE job keywords should ALWAYS score higher than one with fewer
- Penalize for formatting issues that break ATS parsing
- Focus on WHAT IS PRESENT, not subjective judgments about quality
- TARGET: 75%+ match rate is the goal for strong ATS compatibility`;

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
2. Separate them into HARD SKILLS (technical) and SOFT SKILLS (interpersonal)
3. Check if each one appears in the resume (exact or semantic match)
4. Extract the years of experience required vs. what the resume shows
5. Identify leadership/management requirements and evidence
6. Check for ATS-unfriendly formatting issues
7. Check keyword formats (acronym + full form usage)
8. Count measurable results/quantified achievements
9. Analyze resume structure and completeness
10. Compare job title alignment

Provide your analysis in this exact JSON format (no markdown, just JSON):
{
  "ats_score": <number 0-100 - calculate as: (keyword_match * 0.25) + (hard_skills * 0.20) + (soft_skills * 0.10) + (experience_match * 0.15) + (format * 0.10) + (searchability * 0.10) + (measurable_results * 0.10)>,
  "keyword_match_score": <0-100 based on: (matched keywords / total required keywords) * 100>,
  "experience_match_score": <0-100 based on years alignment>,
  "skills_match_score": <0-100 based on combined hard+soft skills present vs required>,
  "format_score": <0-100 based on ATS-readable format - deduct for tables, columns, graphics>,
  "hard_skills_score": <0-100 based on technical/tool skills match>,
  "soft_skills_score": <0-100 based on interpersonal/leadership skills match>,
  "searchability_score": <0-100 based on keyword formats, section headers, and overall ATS parseability>,
  "measurable_results_score": <0-100 based on quantified achievements - 0 for none, 100 for 10+ strong metrics>,
  
  "summary": "<2-3 sentence objective assessment citing SPECIFIC matches and gaps found>",
  
  "job_title_match": {
    "target_title": "<exact job title from posting>",
    "resume_title": "<current/most recent title from resume>",
    "match_level": "exact|strong|partial|weak",
    "recommendation": "<specific suggestion if not exact match>"
  },
  
  "word_count_analysis": {
    "estimated_words": <approximate word count of resume>,
    "ideal_range": "400-800 for 1-page, 600-1000 for 2-page",
    "assessment": "optimal|too_short|too_long",
    "recommendation": "<specific feedback>"
  },
  
  "measurable_results": {
    "count": <number of quantified achievements found>,
    "examples_found": ["<list 3-5 specific quantified statements from resume>"],
    "missing_opportunities": ["<areas where metrics could be added, e.g., 'Add revenue impact to sales role'>"],
    "ideal_count": "8-12 quantified achievements across experience section"
  },
  
  "contact_info_check": {
    "has_email": <true/false>,
    "has_phone": <true/false>,
    "has_linkedin": <true/false>,
    "has_location": <true/false>,
    "issues": ["<any problems like personal email, missing info>"]
  },
  
  "section_analysis": {
    "sections_found": ["<list all sections detected: Summary, Experience, Skills, Education, etc.>"],
    "sections_missing": ["<important sections not found>"],
    "section_order_optimal": <true/false>,
    "recommendations": ["<specific section improvements>"]
  },
  
  "bullet_point_analysis": {
    "total_bullets": <count of bullet points in experience>,
    "bullets_with_metrics": <count starting with action verbs AND containing numbers>,
    "average_bullets_per_role": <number>,
    "weak_bullets": ["<examples of vague or weak bullet points that need improvement>"],
    "strong_bullets": ["<examples of strong action-oriented bullets>"]
  },
  
  "recruiter_tips": [
    "<3-5 specific, actionable tips a recruiter would give, e.g., 'Move Python to top of skills - it appears 4x in JD'>",
    "<e.g., 'Add a Professional Summary - most ATS look for this section'>",
    "<e.g., 'Your most recent title doesn't match - consider adding a headline'>"
  ],
  
  "matched_keywords": ["keyword1", "keyword2", ...list ALL keywords from JD found in resume - be thorough],
  "missing_keywords": ["keyword1", "keyword2", ...up to 15 important keywords from JD NOT found in resume],
  "hard_skills_matched": ["skill1", "skill2", ...technical skills from JD found in resume],
  "hard_skills_missing": ["skill1", "skill2", ...critical technical skills from JD NOT in resume],
  "soft_skills_matched": ["skill1", "skill2", ...interpersonal skills from JD found in resume],
  "soft_skills_missing": ["skill1", "skill2", ...important soft skills from JD NOT in resume],
  
  "formatting_issues": [
    {"issue": "<specific formatting problem>", "severity": "critical|warning|minor", "fix": "<how to fix it>"}
  ],
  "keyword_format_suggestions": [
    {"term": "<keyword that should have both forms>", "current": "<how it appears now>", "suggested": "<recommended format with both acronym and full form>"}
  ],
  
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
  
  "industry_alignment": {
    "job_industry": "<industry from JD>",
    "resume_industries": ["<industries evident from resume experience>"],
    "alignment": "strong|moderate|weak",
    "recommendation": "<how to better position for this industry>"
  },
  
  "education_match": {
    "job_requires": "<education requirements from JD>",
    "resume_shows": "<education from resume>",
    "meets_requirement": <true/false>,
    "notes": "<any gaps or equivalencies>"
  },
  
  "certification_analysis": {
    "required_certs": ["<certifications mentioned as required or preferred in JD>"],
    "resume_certs": ["<certifications found in resume>"],
    "missing_certs": ["<important certs to consider adding>"],
    "bonus_certs": ["<certs in resume that add value>"]
  },
  
  "tech_stack_gaps": ["<technologies mentioned in JD but not in resume>"],
  "recommended_additions": ["<specific addition based on JD requirements>"],
  "role_fit_assessment": "<1 paragraph citing SPECIFIC evidence from both documents>",
  "deal_breakers": ["<only true disqualifying factors that cannot be addressed>"],
  "match_rate_target": "<'On track for 75%+ target' or 'Below 75% target - needs improvement'>",
  
  "quick_wins": [
    "<3-5 changes that would immediately improve score, e.g., 'Add Agile to skills section - mentioned 3x in JD'>",
    "<e.g., 'Add metrics to your most recent 2 bullet points'>",
    "<e.g., 'Include both 'Machine Learning' and 'ML' in skills'>"
  ]
}

SCORING GUIDELINES (be consistent):
- 85-100: Strong keyword match (>80% of required terms), meets experience requirements, no major formatting issues, 8+ quantified achievements
- 70-84: Good match (60-80% keywords), minor gaps, minor formatting issues, 5-7 quantified achievements
- 55-69: Moderate match (40-60% keywords), some gaps, some formatting issues, 3-4 quantified achievements
- 40-54: Weak match (<40% keywords), significant gaps, formatting problems, <3 quantified achievements
- Below 40: Poor alignment, major gaps

CRITICAL: Be thorough in reading BOTH documents. Count actual keyword matches. More matches = higher score. Cite specific evidence. Check formatting issues that break ATS. Provide actionable recruiter tips.`;

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
      console.error("AI response error:", response.status, errorText);
      
      // Check for specific error types
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporarily unavailable",
          error_type: "payment_required",
          message: "Our AI service has reached its usage limit. Please try again later."
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "High demand",
          error_type: "rate_limited",
          message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
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

    // Note: Resume data is not saved to database - session-only processing

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
