import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration - very generous for production testing
const RATE_LIMIT = {
  maxRequests: 1000, // Increased for high-volume production testing
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

    const { resumeText, jobDescription, sessionId, isPostTransformation, email, accessToken, isFreeAnalysis } = body || {};

    // Verify tool access (skip for free analysis - basic scoring only)
    if (!isFreeAnalysis) {
      const accessCheck = await verifyToolAccess(email, accessToken, "resume_suite");
      if (!accessCheck.valid) {
        console.log("Access denied:", accessCheck.error);
        return new Response(JSON.stringify({ error: accessCheck.error || "Access denied" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.log("Free analysis mode - skipping access verification");
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
    // Using industry-standard ATS extraction methodology
    const extractionPrompt = `You are an expert ATS (Applicant Tracking System) parser replicating how systems like Workday, Taleo, Greenhouse, and iCIMS extract data.

CRITICAL: Extract EXACTLY what appears in the documents. Be precise and thorough.

**FROM THE JOB DESCRIPTION, extract:**
1. Job title (exact title from posting - this is CRITICAL as 55.3% of recruiters filter by this)
2. Required years of experience (exact number, e.g., "5+ years" - 44.3% of recruiters filter by this)
3. HARD SKILLS: ALL technical skills, tools, software, platforms, methodologies, programming languages, frameworks (e.g., Python, AWS, Salesforce, Agile, SQL, Excel) - THIS IS THE #1 FILTER used by 76.4% of recruiters
4. SOFT SKILLS: Interpersonal skills, leadership qualities (e.g., communication, collaboration, leadership, problem-solving, teamwork)
5. Required education level (59.7% of recruiters filter by this) - be specific: "Bachelor's in CS", "MBA", etc.
6. Required/preferred certifications (50.6% of recruiters filter by this) - list ALL mentioned
7. Location requirements (43.4% filter by this)
8. Industry/domain keywords
9. Seniority level indicators (entry, mid, senior, lead, manager, director, VP)

**FROM THE RESUME, extract:**
1. Current/most recent job title (EXACT as written - crucial for job title matching)
2. Total years of experience (calculate precisely from dates)
3. ALL hard skills mentioned anywhere in the resume (be exhaustive)
4. ALL soft skills mentioned or demonstrated
5. Education credentials (degree, field, institution)
6. ALL Certifications (include acronyms and full names)
7. Location (city, state/country)
8. Number of bullet points with quantified achievements (numbers/percentages/dollar amounts)
9. Sample of quantified achievements (up to 5 examples)
10. Industries/domains worked in
11. Job titles from all positions

Return ONLY valid JSON in this exact format:
{
  "jd_extraction": {
    "job_title": "<exact job title>",
    "seniority_level": "<entry|mid|senior|lead|manager|director|vp|c-level>",
    "years_required": "<e.g., '5+ years' or 'not specified'>",
    "hard_skills": ["skill1", "skill2", ...list ALL technical skills - be exhaustive],
    "soft_skills": ["skill1", "skill2", ...list ALL soft skills],
    "education_required": "<specific degree requirement or 'not specified'>",
    "education_preferred": "<preferred but not required>",
    "certifications_required": ["cert1", "cert2"],
    "certifications_preferred": ["cert1", "cert2"],
    "location": "<city, state or remote>",
    "remote_hybrid_onsite": "<remote|hybrid|onsite|flexible>",
    "industry_keywords": ["keyword1", "keyword2"],
    "key_responsibilities": ["responsibility1", "responsibility2"]
  },
  "resume_extraction": {
    "current_title": "<most recent job title - exact text>",
    "all_job_titles": ["title1", "title2"],
    "years_experience": "<calculated years, e.g., '7 years'>",
    "hard_skills": ["skill1", "skill2", ...list ALL found - be exhaustive],
    "soft_skills": ["skill1", "skill2", ...list ALL found or demonstrated],
    "education": "<highest degree, field, institution>",
    "education_level": "<high school|associate|bachelor|master|doctorate>",
    "certifications": ["cert1", "cert2"],
    "location": "<city, state/country>",
    "quantified_achievements_count": <number>,
    "quantified_achievements_examples": ["example1", "example2", "example3", "example4", "example5"],
    "industries": ["industry1", "industry2"],
    "has_summary_section": <true/false>,
    "has_skills_section": <true/false>,
    "has_email": <true/false>,
    "has_phone": <true/false>,
    "has_linkedin": <true/false>
  },
  "formatting_assessment": {
    "uses_reverse_chronological": <true/false - most ATS-friendly format>,
    "has_clean_format": <true/false - no tables, columns, graphics detected>,
    "uses_standard_section_headers": <true/false - Work Experience vs Professional Journey>,
    "estimated_word_count": <number>,
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
            temperature: 0, // CRITICAL: Set to 0 for deterministic, consistent results
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

    // Calculate format score (ATS parsing compatibility)
    let formatScore = 100;
    const formatIssues = formatting.issues || [];
    if (!formatting.has_clean_format) formatScore -= 25; // Tables, graphics break ATS parsing
    if (!formatting.uses_standard_section_headers) formatScore -= 15; // Non-standard headers confuse parsers
    if (!formatting.uses_reverse_chronological) formatScore -= 10; // Preferred format by 95% of recruiters
    formatScore -= Math.min(25, formatIssues.length * 8);
    formatScore = Math.max(30, formatScore);

    // Calculate searchability score (contact info completeness)
    let searchabilityScore = 50;
    if (resume.has_summary_section) searchabilityScore += 15;
    if (resume.has_skills_section) searchabilityScore += 15;
    if (resume.has_email) searchabilityScore += 10;
    if (resume.has_phone) searchabilityScore += 5;
    if (resume.has_linkedin) searchabilityScore += 5;
    searchabilityScore = Math.min(100, searchabilityScore);

    // Calculate measurable results score (quantified achievements)
    // Recruiters look for specific metrics - this is a key differentiator
    const achievementCount = resume.quantified_achievements_count || 0;
    let measurableResultsScore = 0;
    if (achievementCount >= 12) measurableResultsScore = 100;
    else if (achievementCount >= 10) measurableResultsScore = 95;
    else if (achievementCount >= 8) measurableResultsScore = 85;
    else if (achievementCount >= 6) measurableResultsScore = 70;
    else if (achievementCount >= 4) measurableResultsScore = 55;
    else if (achievementCount >= 2) measurableResultsScore = 35;
    else if (achievementCount >= 1) measurableResultsScore = 20;
    else measurableResultsScore = 5;

    // Calculate job title match score
    // CRITICAL: Exact job title match = 10.6x more likely to get interview (Jobscan data)
    let titleMatchScore = 30; // Default for no match
    const jdTitle = (jd.job_title || "").toLowerCase().trim();
    const resumeTitle = (resume.current_title || "").toLowerCase().trim();
    const allResumeTitles = (resume.all_job_titles || []).map((t: string) => t.toLowerCase().trim());
    
    if (jdTitle && resumeTitle) {
      // Exact match = highest score (10.6x more likely to get interview)
      if (resumeTitle === jdTitle || allResumeTitles.includes(jdTitle)) {
        titleMatchScore = 100;
      } else if (resumeTitle.includes(jdTitle) || jdTitle.includes(resumeTitle)) {
        titleMatchScore = 90;
      } else {
        // Check for key word overlap in titles
        const jdWords: string[] = jdTitle.split(/[\s\-\/]+/).filter((w: string) => w.length > 2);
        const resumeWords: string[] = resumeTitle.split(/[\s\-\/]+/).filter((w: string) => w.length > 2);
        const allTitleWords: string[] = allResumeTitles.flatMap((t: string) => t.split(/[\s\-\/]+/).filter((w: string) => w.length > 2));
        
        // Check current title overlap
        const currentOverlap = jdWords.filter((w: string) => 
          resumeWords.some((rw: string) => rw.includes(w) || w.includes(rw))
        );
        
        // Check all historical titles overlap
        const allOverlap = jdWords.filter((w: string) => 
          allTitleWords.some((rw: string) => rw.includes(w) || w.includes(rw))
        );
        
        const overlapPercent = Math.max(
          currentOverlap.length / Math.max(jdWords.length, 1),
          allOverlap.length / Math.max(jdWords.length, 1) * 0.8 // Historical titles count 80%
        );
        
        titleMatchScore = Math.round(30 + (overlapPercent * 60)); // 30-90 range
      }
    }

    // Calculate education match score (59.7% of recruiters filter by education)
    let educationScore = 70; // Default if not specified
    const jdEducation = (jd.education_required || "").toLowerCase();
    const resumeEducation = (resume.education || "").toLowerCase();
    const resumeEducationLevel = (resume.education_level || "").toLowerCase();
    
    if (jdEducation && jdEducation !== "not specified") {
      const educationLevels: Record<string, number> = {
        "high school": 1, "ged": 1,
        "associate": 2, "associates": 2,
        "bachelor": 3, "bachelors": 3, "bs": 3, "ba": 3, "b.s.": 3, "b.a.": 3,
        "master": 4, "masters": 4, "ms": 4, "ma": 4, "mba": 4, "m.s.": 4, "m.a.": 4,
        "doctorate": 5, "phd": 5, "ph.d.": 5, "doctoral": 5
      };
      
      let requiredLevel = 0;
      let resumeLevel = 0;
      
      for (const [key, level] of Object.entries(educationLevels)) {
        if (jdEducation.includes(key)) requiredLevel = Math.max(requiredLevel, level);
        if (resumeEducation.includes(key) || resumeEducationLevel.includes(key)) {
          resumeLevel = Math.max(resumeLevel, level);
        }
      }
      
      if (resumeLevel >= requiredLevel) {
        educationScore = 100;
      } else if (resumeLevel === requiredLevel - 1) {
        educationScore = 70; // One level below
      } else if (resumeLevel > 0) {
        educationScore = 40; // Has education but below requirement
      } else {
        educationScore = 20; // No matching education found
      }
    }

    // Calculate certification match score (50.6% of recruiters filter by certifications)
    let certificationScore = 80; // Default if none required
    const jdCertsRequired = (jd.certifications_required || []).map((c: string) => c.toLowerCase());
    const jdCertsPreferred = (jd.certifications_preferred || []).map((c: string) => c.toLowerCase());
    const resumeCerts = (resume.certifications || []).map((c: string) => c.toLowerCase());
    
    if (jdCertsRequired.length > 0) {
      const matchedRequired = jdCertsRequired.filter((cert: string) => 
        resumeCerts.some((rc: string) => rc.includes(cert) || cert.includes(rc) || keywordMatch(cert, rc))
      );
      certificationScore = calculateMatchPercentage(matchedRequired.length, jdCertsRequired.length);
    } else if (jdCertsPreferred.length > 0) {
      const matchedPreferred = jdCertsPreferred.filter((cert: string) => 
        resumeCerts.some((rc: string) => rc.includes(cert) || cert.includes(rc) || keywordMatch(cert, rc))
      );
      // Preferred certs give bonus but don't penalize as heavily
      certificationScore = 60 + Math.round((matchedPreferred.length / jdCertsPreferred.length) * 40);
    }

    // CALCULATE FINAL ATS SCORE using real recruiter filtering behavior
    // Based on Jobscan State of Job Search 2025 data:
    // - 76.4% filter by Skills (hard skills most important)
    // - 59.7% filter by Education
    // - 55.3% filter by Job Title (exact match = 10.6x more likely to get interview)
    // - 50.6% filter by Certifications
    // - 44.3% filter by Years of Experience
    const weights = {
      hardSkills: 0.30,        // #1 filter - 76.4% of recruiters use this
      jobTitle: 0.18,          // Exact match = 10.6x more likely to get interview
      education: 0.12,         // 59.7% of recruiters filter by this
      experience: 0.10,        // 44.3% filter by this
      certifications: 0.08,    // 50.6% filter by this
      softSkills: 0.07,        // Important but less filtered
      measurableResults: 0.07, // Key differentiator for recruiter review
      format: 0.05,            // ATS parsing compatibility
      searchability: 0.03,     // Contact info completeness
    };

    const atsScore = Math.round(
      hardSkillsScore * weights.hardSkills +
      titleMatchScore * weights.jobTitle +
      educationScore * weights.education +
      experienceScore * weights.experience +
      certificationScore * weights.certifications +
      softSkillsScore * weights.softSkills +
      measurableResultsScore * weights.measurableResults +
      formatScore * weights.format +
      searchabilityScore * weights.searchability
    );

    // PHASE 3: Generate human-readable analysis
    const analysisPrompt = `Based on this ATS analysis data, provide human-readable insights.

**SCORES (already calculated - do not recalculate):**
- Overall ATS Score: ${atsScore}/100
- Hard Skills Match: ${hardSkillsScore}% (${hardSkillsMatched.length}/${jdHardSkills.length}) - WEIGHT: 30%
- Job Title Match: ${titleMatchScore}% - WEIGHT: 18%
- Education Match: ${educationScore}% - WEIGHT: 12%
- Experience Match: ${experienceScore}% - WEIGHT: 10%
- Certifications: ${certificationScore}% - WEIGHT: 8%
- Soft Skills Match: ${softSkillsScore}% (${softSkillsMatched.length}/${jdSoftSkills.length}) - WEIGHT: 7%
- Measurable Results: ${measurableResultsScore}% (${achievementCount} quantified achievements) - WEIGHT: 7%
- Format Score: ${formatScore}% - WEIGHT: 5%
- Searchability: ${searchabilityScore}% - WEIGHT: 3%

**MATCHED HARD SKILLS:** ${hardSkillsMatched.join(", ") || "None"}
**MISSING HARD SKILLS:** ${hardSkillsMissing.join(", ") || "None"}
**MATCHED SOFT SKILLS:** ${softSkillsMatched.join(", ") || "None"}
**MISSING SOFT SKILLS:** ${softSkillsMissing.join(", ") || "None"}

**JOB REQUIRES:** ${jd.years_required} experience
**RESUME SHOWS:** ${resume.years_experience}

**JOB TITLE TARGET:** ${jd.job_title}
**RESUME CURRENT TITLE:** ${resume.current_title}
**ALL RESUME TITLES:** ${(resume.all_job_titles || []).join(", ")}

**EDUCATION REQUIRED:** ${jd.education_required || "Not specified"}
**RESUME EDUCATION:** ${resume.education}

**CERTIFICATIONS REQUIRED:** ${(jd.certifications_required || []).join(", ") || "None"}
**RESUME CERTIFICATIONS:** ${(resume.certifications || []).join(", ") || "None"}

Provide ONLY this JSON (no markdown):
{
  "summary": "<2-3 sentences explaining the score. Emphasize that hard skills (30%) and job title (18%) are the most important factors>",
  "strengths": ["<3-5 specific strengths based on what matched>"],
  "improvements": [
    {"priority": "critical|high|medium", "issue": "<specific gap>", "fix": "<actionable fix>"}
  ],
  "recruiter_tips": ["<3-5 specific tips based on recruiter behavior - 76.4% filter by skills, 55.3% by job title, 59.7% by education>"],
  "quick_wins": ["<3-5 easy changes that would improve the score - focus on job title and missing skills>"],
  "role_fit_assessment": "<1 paragraph assessment based on the data>",
  "years_experience_analysis": {
    "job_requires": "${jd.years_required}",
    "resume_shows": "${resume.years_experience}",
    "gap": "<meets requirement or specific gap>"
  },
  "job_title_match": {
    "target_title": "${jd.job_title}",
    "resume_title": "${resume.current_title}",
    "match_level": "${titleMatchScore >= 95 ? 'exact' : titleMatchScore >= 80 ? 'strong' : titleMatchScore >= 50 ? 'partial' : 'weak'}",
    "recommendation": "<if not exact, emphasize that exact job title match = 10.6x more likely to get interview>"
  },
  "education_analysis": {
    "required": "${jd.education_required || 'Not specified'}",
    "resume_shows": "${resume.education}",
    "meets_requirement": ${educationScore >= 80}
  },
  "skills_gaps": [
    {"skill": "<from missing hard skills - prioritize technical skills>", "importance": "critical|high|medium", "context": "<why it matters for this role>"}
  ],
  "experience_gaps": ["<based on JD requirements vs resume>"],
  "certification_analysis": {
    "required_certs": ${JSON.stringify(jd.certifications_required || [])},
    "preferred_certs": ${JSON.stringify(jd.certifications_preferred || [])},
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
        temperature: 0, // CRITICAL: Set to 0 for deterministic, consistent results
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

    // Construct final result with algorithmic scores based on real ATS/recruiter behavior
    const atsResult = {
      // Primary algorithmic scores (consistent and reproducible)
      ats_score: atsScore,
      keyword_match_score: keywordMatchScore,
      experience_match_score: experienceScore,
      skills_match_score: Math.round((hardSkillsScore * 0.8 + softSkillsScore * 0.2)), // Hard skills weighted higher
      format_score: formatScore,
      hard_skills_score: hardSkillsScore,
      soft_skills_score: softSkillsScore,
      searchability_score: searchabilityScore,
      measurable_results_score: measurableResultsScore,
      education_score: educationScore,
      certification_score: certificationScore,
      job_title_score: titleMatchScore,

      // Keyword lists (deterministic)
      matched_keywords: matchedKeywords,
      missing_keywords: missingKeywords.slice(0, 15),
      hard_skills_matched: hardSkillsMatched,
      hard_skills_missing: hardSkillsMissing,
      soft_skills_matched: softSkillsMatched,
      soft_skills_missing: softSkillsMissing,

      // AI-generated insights
      summary: analysis.summary || `Your resume matches ${hardSkillsScore}% of required hard skills (most important factor). Job title match: ${titleMatchScore >= 95 ? 'Exact' : titleMatchScore >= 80 ? 'Strong' : 'Needs improvement'}.`,
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      recruiter_tips: analysis.recruiter_tips || [
        "76.4% of recruiters filter by skills - ensure all required skills are listed",
        "55.3% filter by job title - use the exact job title in your headline",
        "59.7% filter by education - match the degree requirements",
        titleMatchScore < 90 ? "Exact job title match = 10.6x more likely to get interview" : null
      ].filter(Boolean),
      quick_wins: analysis.quick_wins || [],
      role_fit_assessment: analysis.role_fit_assessment || "",
      
      // Experience analysis
      years_experience_analysis: analysis.years_experience_analysis || {
        job_requires: jd.years_required || "Not specified",
        resume_shows: resume.years_experience || "Not calculated",
        gap: experienceScore >= 85 ? "Meets requirement" : "Below requirement"
      },
      
      // Job title analysis (CRITICAL - 10.6x interview boost for exact match)
      job_title_match: analysis.job_title_match || {
        target_title: jd.job_title,
        resume_title: resume.current_title,
        all_resume_titles: resume.all_job_titles || [],
        match_level: titleMatchScore >= 95 ? "exact" : titleMatchScore >= 80 ? "strong" : titleMatchScore >= 50 ? "partial" : "weak",
        match_score: titleMatchScore,
        recommendation: titleMatchScore < 95 ? "Add the exact job title to your resume headline - candidates with exact job title match are 10.6x more likely to get an interview" : "Great! Your job title matches the target role."
      },
      
      // Education analysis (59.7% of recruiters filter by this)
      education_match: analysis.education_analysis || {
        job_requires: jd.education_required || "Not specified",
        resume_shows: resume.education || "Not found",
        meets_requirement: educationScore >= 80,
        score: educationScore,
        notes: educationScore >= 100 ? "Meets or exceeds education requirement" : 
               educationScore >= 70 ? "Close to requirement" : 
               "Education gap may be a filter issue"
      },
      
      // Skills gaps with importance
      skills_gaps: analysis.skills_gaps || hardSkillsMissing.slice(0, 8).map((s: string, i: number) => ({
        skill: s,
        importance: i < 3 ? "critical" : i < 6 ? "high" : "medium",
        context: "Required in job description - 76.4% of recruiters filter by skills"
      })),
      experience_gaps: analysis.experience_gaps || [],
      
      // Certification analysis (50.6% of recruiters filter by this)
      certification_analysis: analysis.certification_analysis || {
        required_certs: jd.certifications_required || [],
        preferred_certs: jd.certifications_preferred || [],
        resume_certs: resume.certifications || [],
        missing_certs: (jd.certifications_required || []).filter((c: string) => 
          !(resume.certifications || []).some((rc: string) => 
            rc.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(rc.toLowerCase())
          )
        ),
        score: certificationScore
      },
      
      // Measurable results
      measurable_results: {
        count: achievementCount,
        examples_found: resume.quantified_achievements_examples || [],
        ideal_count: "8-12 quantified achievements",
        recommendation: achievementCount < 8 ? "Add more metrics and numbers to your achievements" : "Good number of quantified achievements"
      },
      
      // Formatting issues
      formatting_issues: (formatting.issues || []).map((issue: string) => ({
        issue,
        severity: "warning",
        fix: "Review and fix this formatting issue - clean formatting helps ATS parsing"
      })),
      
      // Technical skills gaps
      tech_stack_gaps: hardSkillsMissing.filter((s: string) => 
        /python|java|javascript|sql|aws|azure|gcp|react|node|typescript|docker|kubernetes|terraform|git|ci\/cd|agile|scrum/i.test(s)
      ),

      // Score breakdown for transparency - using real recruiter filter percentages
      score_breakdown: {
        hard_skills: { 
          score: hardSkillsScore, 
          weight: "30%", 
          matched: hardSkillsMatched.length, 
          total: jdHardSkills.length,
          recruiter_filter_rate: "76.4% of recruiters filter by skills"
        },
        job_title: { 
          score: titleMatchScore, 
          weight: "18%",
          recruiter_filter_rate: "55.3% filter by job title",
          note: "Exact match = 10.6x more likely to get interview"
        },
        education: { 
          score: educationScore, 
          weight: "12%",
          recruiter_filter_rate: "59.7% filter by education"
        },
        experience: { 
          score: experienceScore, 
          weight: "10%",
          recruiter_filter_rate: "44.3% filter by years of experience"
        },
        certifications: { 
          score: certificationScore, 
          weight: "8%",
          recruiter_filter_rate: "50.6% filter by certifications"
        },
        soft_skills: { 
          score: softSkillsScore, 
          weight: "7%", 
          matched: softSkillsMatched.length, 
          total: jdSoftSkills.length 
        },
        measurable_results: { 
          score: measurableResultsScore, 
          weight: "7%", 
          count: achievementCount 
        },
        format: { 
          score: formatScore, 
          weight: "5%",
          note: "ATS parsing compatibility"
        },
        searchability: { 
          score: searchabilityScore, 
          weight: "3%" 
        },
      },
      
      match_rate_target: atsScore >= 75 ? "On track for 75%+ target - good chance of passing ATS filters" : "Below 75% target - likely to be filtered out by ATS"
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
