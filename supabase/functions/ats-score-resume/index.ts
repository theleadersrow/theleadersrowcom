import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 120,
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

    await supabase
      .from("tool_purchases")
      .update({
        usage_count: (purchase.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    return { valid: true };
  }

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

// Normalize text for matching (lowercase, remove punctuation, handle plurals)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if keyword exists in text (exact or fuzzy match)
function keywordMatch(keyword: string, text: string): boolean {
  const normalizedKeyword = normalizeText(keyword);
  const normalizedText = normalizeText(text);
  
  // Exact match
  if (normalizedText.includes(normalizedKeyword)) return true;
  
  // Handle common variations
  const variations = [
    normalizedKeyword,
    normalizedKeyword.replace(/s$/, ''), // Remove trailing s
    normalizedKeyword + 's', // Add trailing s
    normalizedKeyword.replace(/-/g, ' '), // Replace hyphens with spaces
    normalizedKeyword.replace(/ /g, '-'), // Replace spaces with hyphens
  ];
  
  for (const variant of variations) {
    if (normalizedText.includes(variant)) return true;
  }
  
  // Check for word boundaries
  const wordBoundaryRegex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (wordBoundaryRegex.test(text)) return true;
  
  return false;
}

// Calculate percentage match
function calculateMatchPercentage(matched: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((matched / total) * 100);
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

    // Rate limit
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
    
    const safeResumeText = resumeText.slice(0, 50000);
    const safeJobDescription = jobDescription.slice(0, 20000);

    // PHASE 1: AI extracts structured data from both documents
    const extractionPrompt = `You are an expert ATS keyword extractor. Your job is to EXTRACT and LIST specific items from both documents.

CRITICAL: Extract EXACTLY what appears in the documents. Do not infer or add keywords that aren't there.

**FROM THE JOB DESCRIPTION, extract:**
1. Job title (exact title from posting)
2. Required years of experience (exact number, e.g., "5+ years")
3. HARD SKILLS: All technical skills, tools, software, platforms, methodologies, programming languages, frameworks (e.g., Python, AWS, Salesforce, Agile, SQL, Excel)
4. SOFT SKILLS: Interpersonal skills, leadership qualities (e.g., communication, collaboration, leadership, problem-solving, teamwork)
5. Required education level
6. Required/preferred certifications
7. Industry/domain keywords

**FROM THE RESUME, extract:**
1. Current/most recent job title
2. Total years of experience (calculate from dates)
3. ALL hard skills mentioned anywhere in the resume
4. ALL soft skills mentioned or demonstrated
5. Education credentials
6. Certifications
7. Number of quantified achievements (bullets with numbers/percentages/dollar amounts)
8. Industries worked in

Return ONLY valid JSON in this exact format:
{
  "jd_extraction": {
    "job_title": "<exact job title>",
    "years_required": "<e.g., '5+ years' or 'not specified'>",
    "hard_skills": ["skill1", "skill2", ...list ALL technical skills],
    "soft_skills": ["skill1", "skill2", ...list ALL soft skills],
    "education_required": "<degree requirement or 'not specified'>",
    "certifications_required": ["cert1", "cert2"],
    "certifications_preferred": ["cert1", "cert2"],
    "industry_keywords": ["keyword1", "keyword2"],
    "key_responsibilities": ["responsibility1", "responsibility2"]
  },
  "resume_extraction": {
    "current_title": "<most recent job title>",
    "years_experience": "<calculated years, e.g., '7 years'>",
    "hard_skills": ["skill1", "skill2", ...list ALL found],
    "soft_skills": ["skill1", "skill2", ...list ALL found or demonstrated],
    "education": "<highest degree and field>",
    "certifications": ["cert1", "cert2"],
    "quantified_achievements_count": <number>,
    "quantified_achievements_examples": ["example1", "example2", "example3"],
    "industries": ["industry1", "industry2"],
    "has_summary_section": <true/false>,
    "has_skills_section": <true/false>,
    "contact_complete": <true/false - has email, phone, location>
  },
  "formatting_assessment": {
    "has_clean_format": <true/false - no tables, columns, graphics detected>,
    "uses_standard_sections": <true/false>,
    "issues": ["issue1", "issue2"]
  }
}`;

    console.log("Phase 1: Extracting keywords from documents...");

    // Retry logic for AI calls
    let extractionResponse: Response | null = null;
    let lastError: string = "";
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: extractionPrompt },
              { role: "user", content: `**JOB DESCRIPTION:**\n${safeJobDescription}\n\n**RESUME:**\n${safeResumeText}` },
            ],
          }),
        });
        
        if (extractionResponse.ok) break;
        
        lastError = await extractionResponse.text();
        console.error(`Extraction attempt ${attempt + 1} failed:`, extractionResponse.status, lastError);
        
        // Don't retry on payment/auth errors
        if (extractionResponse.status === 402 || extractionResponse.status === 403) break;
        
        // Wait before retry with exponential backoff
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
        }
      } catch (fetchError) {
        console.error(`Extraction fetch attempt ${attempt + 1} error:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError.message : "Network error";
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
        }
      }
    }

    if (!extractionResponse || !extractionResponse.ok) {
      console.error("Extraction failed after retries:", lastError);
      
      if (extractionResponse?.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporarily unavailable",
          error_type: "payment_required",
        }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (extractionResponse?.status === 429) {
        return new Response(JSON.stringify({ 
          error: "High demand, please try again",
          error_type: "rate_limited",
        }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`Failed to extract keywords: ${lastError}`);
    }

    const extractionData = await extractionResponse.json();
    const extractionContent = extractionData.choices?.[0]?.message?.content || "";
    
    let extraction: any;
    try {
      const jsonMatch = extractionContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extraction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error("Error parsing extraction:", e);
      throw new Error("Failed to parse extraction results");
    }

    const jd = extraction.jd_extraction || {};
    const resume = extraction.resume_extraction || {};
    const formatting = extraction.formatting_assessment || {};

    // PHASE 2: ALGORITHMIC SCORING - This is deterministic and consistent
    console.log("Phase 2: Calculating scores algorithmically...");

    // Calculate hard skills match
    const jdHardSkills = (jd.hard_skills || []).map((s: string) => s.toLowerCase());
    const resumeHardSkills = (resume.hard_skills || []).map((s: string) => s.toLowerCase());
    const hardSkillsMatched: string[] = [];
    const hardSkillsMissing: string[] = [];
    
    for (const skill of jd.hard_skills || []) {
      const found = resumeHardSkills.some((rs: string) => 
        keywordMatch(skill, rs) || keywordMatch(rs, skill) || 
        keywordMatch(skill, safeResumeText)
      );
      if (found) {
        hardSkillsMatched.push(skill);
      } else {
        hardSkillsMissing.push(skill);
      }
    }
    const hardSkillsScore = calculateMatchPercentage(hardSkillsMatched.length, jdHardSkills.length);

    // Calculate soft skills match
    const jdSoftSkills = (jd.soft_skills || []).map((s: string) => s.toLowerCase());
    const resumeSoftSkills = (resume.soft_skills || []).map((s: string) => s.toLowerCase());
    const softSkillsMatched: string[] = [];
    const softSkillsMissing: string[] = [];
    
    for (const skill of jd.soft_skills || []) {
      const found = resumeSoftSkills.some((rs: string) => 
        keywordMatch(skill, rs) || keywordMatch(rs, skill) ||
        keywordMatch(skill, safeResumeText)
      );
      if (found) {
        softSkillsMatched.push(skill);
      } else {
        softSkillsMissing.push(skill);
      }
    }
    const softSkillsScore = calculateMatchPercentage(softSkillsMatched.length, jdSoftSkills.length);

    // Calculate overall keyword match (all JD keywords in resume)
    const allJdKeywords = [...(jd.hard_skills || []), ...(jd.soft_skills || []), ...(jd.industry_keywords || [])];
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    
    for (const keyword of allJdKeywords) {
      if (keywordMatch(keyword, safeResumeText)) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }
    const keywordMatchScore = calculateMatchPercentage(matchedKeywords.length, allJdKeywords.length);

    // Calculate experience match
    let experienceScore = 50; // Default
    const jdYears = jd.years_required || "";
    const resumeYears = resume.years_experience || "";
    
    const jdYearsNum = parseInt(jdYears.match(/(\d+)/)?.[1] || "0");
    const resumeYearsNum = parseInt(resumeYears.match(/(\d+)/)?.[1] || "0");
    
    if (jdYearsNum > 0) {
      if (resumeYearsNum >= jdYearsNum) {
        experienceScore = 100;
      } else if (resumeYearsNum >= jdYearsNum - 1) {
        experienceScore = 85;
      } else if (resumeYearsNum >= jdYearsNum - 2) {
        experienceScore = 70;
      } else {
        experienceScore = Math.max(30, Math.round((resumeYearsNum / jdYearsNum) * 100));
      }
    } else {
      experienceScore = 80; // Not specified in JD
    }

    // Calculate format score
    let formatScore = 100;
    const formatIssues = formatting.issues || [];
    if (!formatting.has_clean_format) formatScore -= 20;
    if (!formatting.uses_standard_sections) formatScore -= 15;
    formatScore -= Math.min(30, formatIssues.length * 10);
    formatScore = Math.max(40, formatScore);

    // Calculate searchability score (sections, contact info)
    let searchabilityScore = 70;
    if (resume.has_summary_section) searchabilityScore += 10;
    if (resume.has_skills_section) searchabilityScore += 10;
    if (resume.contact_complete) searchabilityScore += 10;
    searchabilityScore = Math.min(100, searchabilityScore);

    // Calculate measurable results score
    const achievementCount = resume.quantified_achievements_count || 0;
    let measurableResultsScore = 0;
    if (achievementCount >= 10) measurableResultsScore = 100;
    else if (achievementCount >= 8) measurableResultsScore = 90;
    else if (achievementCount >= 6) measurableResultsScore = 75;
    else if (achievementCount >= 4) measurableResultsScore = 60;
    else if (achievementCount >= 2) measurableResultsScore = 40;
    else if (achievementCount >= 1) measurableResultsScore = 25;
    else measurableResultsScore = 10;

    // Calculate job title match score
    let titleMatchScore = 50;
    const jdTitle = (jd.job_title || "").toLowerCase();
    const resumeTitle = (resume.current_title || "").toLowerCase();
    if (jdTitle && resumeTitle) {
      if (resumeTitle.includes(jdTitle) || jdTitle.includes(resumeTitle)) {
        titleMatchScore = 100;
      } else {
        // Check for key words overlap
        const jdWords: string[] = jdTitle.split(/\s+/).filter((w: string) => w.length > 2);
        const resumeWords: string[] = resumeTitle.split(/\s+/).filter((w: string) => w.length > 2);
        const overlap = jdWords.filter((w: string) => resumeWords.some((rw: string) => rw.includes(w) || w.includes(rw)));
        titleMatchScore = Math.max(30, Math.round((overlap.length / Math.max(jdWords.length, 1)) * 100));
      }
    }

    // CALCULATE FINAL ATS SCORE using Jobscan-style weighting
    // Jobscan typically weights: Hard Skills (25%), Keywords (20%), Job Title (15%), 
    // Soft Skills (10%), Education (10%), Experience (10%), Measurable Results (10%)
    const weights = {
      hardSkills: 0.25,
      keywordMatch: 0.20,
      jobTitle: 0.15,
      softSkills: 0.10,
      experience: 0.10,
      measurableResults: 0.10,
      format: 0.05,
      searchability: 0.05,
    };

    const atsScore = Math.round(
      hardSkillsScore * weights.hardSkills +
      keywordMatchScore * weights.keywordMatch +
      titleMatchScore * weights.jobTitle +
      softSkillsScore * weights.softSkills +
      experienceScore * weights.experience +
      measurableResultsScore * weights.measurableResults +
      formatScore * weights.format +
      searchabilityScore * weights.searchability
    );

    // PHASE 3: Generate human-readable analysis
    const analysisPrompt = `Based on this ATS analysis data, provide human-readable insights.

**SCORES (already calculated - do not recalculate):**
- Overall ATS Score: ${atsScore}/100
- Hard Skills Match: ${hardSkillsScore}% (${hardSkillsMatched.length}/${jdHardSkills.length})
- Soft Skills Match: ${softSkillsScore}% (${softSkillsMatched.length}/${jdSoftSkills.length})
- Keyword Match: ${keywordMatchScore}% (${matchedKeywords.length}/${allJdKeywords.length})
- Experience Match: ${experienceScore}%
- Format Score: ${formatScore}%
- Measurable Results: ${measurableResultsScore}% (${achievementCount} quantified achievements)

**MATCHED HARD SKILLS:** ${hardSkillsMatched.join(", ") || "None"}
**MISSING HARD SKILLS:** ${hardSkillsMissing.join(", ") || "None"}
**MATCHED SOFT SKILLS:** ${softSkillsMatched.join(", ") || "None"}
**MISSING SOFT SKILLS:** ${softSkillsMissing.join(", ") || "None"}

**JOB REQUIRES:** ${jd.years_required} experience
**RESUME SHOWS:** ${resume.years_experience}

**JOB TITLE:** ${jd.job_title}
**RESUME TITLE:** ${resume.current_title}

Provide ONLY this JSON (no markdown):
{
  "summary": "<2-3 sentences explaining the score based on the actual match percentages above>",
  "strengths": ["<3-5 specific strengths based on what matched>"],
  "improvements": [
    {"priority": "critical|high|medium", "issue": "<specific gap>", "fix": "<actionable fix>"}
  ],
  "recruiter_tips": ["<3-5 specific tips based on the gaps identified>"],
  "quick_wins": ["<3-5 easy changes that would improve the score>"],
  "role_fit_assessment": "<1 paragraph assessment based on the data>",
  "years_experience_analysis": {
    "job_requires": "${jd.years_required}",
    "resume_shows": "${resume.years_experience}",
    "gap": "<meets requirement or specific gap>"
  },
  "job_title_match": {
    "target_title": "${jd.job_title}",
    "resume_title": "${resume.current_title}",
    "match_level": "<exact|strong|partial|weak>",
    "recommendation": "<if not exact, how to improve>"
  },
  "skills_gaps": [
    {"skill": "<from missing hard skills>", "importance": "critical|high|medium", "context": "<why it matters>"}
  ],
  "experience_gaps": ["<based on JD requirements vs resume>"],
  "certification_analysis": {
    "required_certs": ${JSON.stringify(jd.certifications_required || [])},
    "resume_certs": ${JSON.stringify(resume.certifications || [])},
    "missing_certs": ["<important ones to get>"]
  }
}`;

    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You provide human-readable ATS analysis insights. Return ONLY valid JSON." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    let analysis: any = {};
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      const analysisContent = analysisData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Error parsing analysis:", e);
      }
    }

    // Construct final result with algorithmic scores
    const atsResult = {
      // Algorithmic scores (consistent and reproducible)
      ats_score: atsScore,
      keyword_match_score: keywordMatchScore,
      experience_match_score: experienceScore,
      skills_match_score: Math.round((hardSkillsScore * 0.7 + softSkillsScore * 0.3)),
      format_score: formatScore,
      hard_skills_score: hardSkillsScore,
      soft_skills_score: softSkillsScore,
      searchability_score: searchabilityScore,
      measurable_results_score: measurableResultsScore,

      // Keyword lists (deterministic)
      matched_keywords: matchedKeywords,
      missing_keywords: missingKeywords.slice(0, 15),
      hard_skills_matched: hardSkillsMatched,
      hard_skills_missing: hardSkillsMissing,
      soft_skills_matched: softSkillsMatched,
      soft_skills_missing: softSkillsMissing,

      // AI-generated insights
      summary: analysis.summary || `Your resume matches ${keywordMatchScore}% of keywords and ${hardSkillsScore}% of hard skills from the job description.`,
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      recruiter_tips: analysis.recruiter_tips || [],
      quick_wins: analysis.quick_wins || [],
      role_fit_assessment: analysis.role_fit_assessment || "",
      years_experience_analysis: analysis.years_experience_analysis || {
        job_requires: jd.years_required,
        resume_shows: resume.years_experience,
        gap: experienceScore >= 85 ? "Meets requirement" : "Below requirement"
      },
      job_title_match: analysis.job_title_match || {
        target_title: jd.job_title,
        resume_title: resume.current_title,
        match_level: titleMatchScore >= 80 ? "strong" : titleMatchScore >= 50 ? "partial" : "weak",
        recommendation: titleMatchScore < 80 ? "Consider aligning your headline/title with the job title" : ""
      },
      skills_gaps: analysis.skills_gaps || hardSkillsMissing.slice(0, 5).map((s: string) => ({
        skill: s,
        importance: "high",
        context: "Required in job description"
      })),
      experience_gaps: analysis.experience_gaps || [],
      certification_analysis: analysis.certification_analysis || {
        required_certs: jd.certifications_required || [],
        resume_certs: resume.certifications || [],
        missing_certs: []
      },
      measurable_results: {
        count: achievementCount,
        examples_found: resume.quantified_achievements_examples || [],
        ideal_count: "8-12 quantified achievements"
      },
      formatting_issues: (formatting.issues || []).map((issue: string) => ({
        issue,
        severity: "warning",
        fix: "Review and fix this formatting issue"
      })),
      tech_stack_gaps: hardSkillsMissing.filter((s: string) => 
        /python|java|sql|aws|azure|react|node|typescript|docker|kubernetes/i.test(s)
      ),

      // Score breakdown for transparency
      score_breakdown: {
        hard_skills: { score: hardSkillsScore, weight: "25%", matched: hardSkillsMatched.length, total: jdHardSkills.length },
        keywords: { score: keywordMatchScore, weight: "20%", matched: matchedKeywords.length, total: allJdKeywords.length },
        job_title: { score: titleMatchScore, weight: "15%" },
        soft_skills: { score: softSkillsScore, weight: "10%", matched: softSkillsMatched.length, total: jdSoftSkills.length },
        experience: { score: experienceScore, weight: "10%" },
        measurable_results: { score: measurableResultsScore, weight: "10%", count: achievementCount },
        format: { score: formatScore, weight: "5%" },
        searchability: { score: searchabilityScore, weight: "5%" },
      },
      
      match_rate_target: atsScore >= 75 ? "On track for 75%+ target" : "Below 75% target - needs improvement"
    };

    console.log("ATS Score calculated:", atsScore, "Hard skills:", hardSkillsScore, "Keywords:", keywordMatchScore);

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
