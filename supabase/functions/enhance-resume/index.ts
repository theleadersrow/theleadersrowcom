import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription, selfProjection, missingKeywords, improvements, experienceGaps, skillsGaps, techStackGaps, email, accessToken } = await req.json();

    // Verify tool access
    const accessCheck = await verifyToolAccess(email, accessToken, "resume_suite");
    if (!accessCheck.valid) {
      console.log("Access denied:", accessCheck.error);
      return new Response(JSON.stringify({ error: accessCheck.error || "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resumeText) {
      return new Response(JSON.stringify({ error: "Resume text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert executive resume writer with 20+ years placing candidates at Fortune 500 companies. Generate a FINAL AI-OPTIMIZED RESUME using the EXACT structure below.

===== RESUME FORMATTING CONTRACT (HARD RULES) =====
This resume MUST follow a strict, executive, single-column layout.
Formatting is NOT optional. If rules are violated, regenerate before returning.

This resume must:
- Look like a clean executive resume (not AI text)
- Be scannable in 6–8 seconds
- Be ATS-safe
- Be visually identical in structure to the reference format

DO NOT:
- Show the original uploaded resume
- Use tables, columns, icons, emojis, or graphics
- Merge sections together
- Change section order

===== HEADER FORMAT =====
Line 1 (Largest text): FULL NAME (Title Case)
Line 2: Primary Title | Core Strengths (pipe-separated, max 6–8 words each)
Line 3: Email | LinkedIn URL | City, State

Spacing: One blank line after header. No bold except name.

===== SECTION STYLE RULES =====
- Section headers must be ALL CAPS
- Section headers must be left-aligned
- One blank line after each section header
- Bullet points only in Experience sections
- Metrics must be bolded ONLY (no italics)

===== SECTION ORDER (STRICT) =====
1. SUMMARY
2. KEY ACHIEVEMENTS
3. EXPERIENCE
4. EDUCATION
5. INDUSTRY EXPERTISE

===== SECTION FORMATS =====

SUMMARY:
- Single paragraph, 4-5 lines max
- No bullets, no fluff
- Senior, outcome-driven tone
- Start with role + years of experience
- Mention domains (platforms, enterprise, automation, etc.)
- Include scale and impact
- Mention leadership + execution
- Do NOT use first person or buzzwords without outcomes

KEY ACHIEVEMENTS:
- 4 achievement blocks
- Each block: Short bolded headline (3–6 words), then one sentence explanation with **metrics**
- Headlines must be impact-first
- Metrics are mandatory where possible
- Keep each block to max 2 lines

EXPERIENCE:
For EACH role, use this EXACT format:

ROLE TITLE
Company Name
City, State | MM/YYYY – MM/YYYY (or Present)

• One-line scope statement (what you owned, scale, domain)
• Action → Outcome → **Metric**
• Action → Outcome → **Metric**
(max 8 bullets per role)

Rules:
- Role title must be bold
- Company name must be bold
- Bullets must start with strong verbs
- Metrics must be bolded
- No paragraph bullets

EDUCATION:
DEGREE
University Name
(No dates unless required. No bullets.)

INDUSTRY EXPERTISE:
Single line, pipe-separated categories. Max 6 categories. No bullets, no descriptions.
Example: Leadership | Strategic Management | Process Optimization & Efficiency

===== CRITICAL RULES =====
- PRESERVE ALL JOBS from original resume - never omit any work experience
- PRESERVE actual job titles, company names, employment dates, education
- REFRAME experience to match target job while preserving authenticity
- QUANTIFY with **bolded** metrics, percentages, dollar amounts
- Match language to job description terminology

Return your response as valid JSON with this structure:
{
  "enhancedContent": "THE COMPLETE REWRITTEN RESUME following the exact format above. MUST include ALL jobs from original. Ready to use.",
  "contentImprovements": [
    {"section": "Experience - Company Name", "original": "exact original bullet", "improved": "rewritten bullet with **metrics**", "reason": "why this targets the job better"}
  ],
  "addedKeywords": ["keywords naturally woven in"],
  "quantifiedAchievements": ["Achievement statements with **specific numbers**"],
  "actionVerbUpgrades": [{"original": "weak verb", "improved": "strong verb"}],
  "summaryRewrite": "The new professional summary",
  "transformationNotes": "Brief explanation of transformation strategy"
}

CRITICAL REQUIREMENTS:
1. Include improvements for EVERY job position in the resume
2. Provide 10-20+ contentImprovements entries
3. "original" must be EXACT text from original resume
4. Label improvements with "Experience - [Company Name]" format`;

    const userPrompt = `COMPLETELY TRANSFORM this resume for the target job. Rewrite it to maximize ATS score and hiring manager appeal while preserving the candidate's authentic experience.

=== ORIGINAL RESUME ===
${resumeText}

${jobDescription ? `=== TARGET JOB DESCRIPTION ===
${jobDescription}

CRITICAL: Align the resume language, skills emphasis, and achievement framing to match what this job is looking for. Use their actual experience but position it to show they're perfect for THIS role.` : ''}

${selfProjection ? `=== CANDIDATE'S PROFESSIONAL IDENTITY ===
They want to be perceived as: "${selfProjection}"

Use this to:
- Craft a professional summary reflecting their authentic voice
- Choose language that matches how they see themselves professionally
- Emphasize achievements that align with their stated strengths` : ''}

${missingKeywords?.length > 0 ? `=== CRITICAL KEYWORDS TO INTEGRATE ===
These keywords are MISSING and must be naturally woven into the resume:
${missingKeywords.join(', ')}

Don't just list these - integrate them into actual experience descriptions where they authentically apply.` : ''}

${skillsGaps?.length > 0 ? `=== SKILL GAPS TO ADDRESS ===
The ATS identified these skill gaps. Where the candidate has related/transferable experience, reframe existing bullets to highlight it:
${skillsGaps.map((gap: any) => `- ${gap.skill}: ${gap.gap} (Importance: ${gap.importance})`).join('\n')}` : ''}

${techStackGaps?.length > 0 ? `=== TECH STACK GAPS ===
Missing technical skills. If the candidate has experience with similar/related technologies, highlight transferable skills:
${techStackGaps.map((gap: any) => `- ${gap.technology}: ${gap.gap}`).join('\n')}` : ''}

${experienceGaps?.length > 0 ? `=== EXPERIENCE GAPS TO ADDRESS ===
${experienceGaps.join('\n')}

For gaps that CANNOT be filled (like years of experience), acknowledge in transformationNotes. For gaps that CAN be addressed through reframing (like leadership experience hidden in their current bullets), reframe to highlight it.` : ''}

${improvements?.length > 0 ? `=== SPECIFIC IMPROVEMENTS NEEDED ===
${improvements.map((imp: any) => `- ${imp.issue}: ${imp.fix}`).join('\n')}` : ''}

=== YOUR TASK - FOLLOW EXACT FORMAT ===
Generate a resume with this EXACT section order:
1. HEADER (Name, Title | Strengths, Contact)
2. SUMMARY (4-5 line paragraph, no bullets)
3. KEY ACHIEVEMENTS (4 blocks: bolded headline + one sentence with **metrics**)
4. EXPERIENCE (Each role: Title, Company, Dates, then bullets with **metrics**)
5. EDUCATION (Degree, University - no dates, no bullets)
6. INDUSTRY EXPERTISE (Single pipe-separated line, max 6 categories)

**CRITICAL FORMATTING RULES:**
- Section headers must be ALL CAPS
- Metrics must be wrapped in **bold markers**
- Bullet points ONLY in Experience section
- No tables, columns, icons, emojis, or graphics
- Each role needs: Job Title (bold), Company (bold), Dates, then 4-8 bullets

**CRITICAL - ALL JOBS MUST BE INCLUDED:**
- Count all jobs in the original resume
- The "enhancedContent" MUST include EVERY SINGLE ONE
- Do NOT skip, omit, or truncate any work experience
- Each job must have: Job Title, Company Name, Dates, and rewritten bullet points

**VALIDATION CHECK (MANDATORY):**
Before returning, confirm:
- This is NOT the uploaded resume - content is fully rewritten
- Formatting matches the enforced structure exactly
- Section headers are ALL CAPS and in correct order
- Metrics are wrapped in **bold markers**
- ALL original jobs are included

In contentImprovements, include improvements from EVERY job/company. Label each with "Experience - [Company Name]" format.

The output "enhancedContent" must be the COMPLETE, READY-TO-USE resume following the exact format above. Label it as: "AI-Optimized Resume – Ready to Submit"

Return the result as JSON with the specified structure.`;

    console.log("Calling Lovable AI for complete resume transformation...");

    // Retry logic for AI calls
    let response: Response | null = null;
    let lastError: string = "";
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });
        
        if (response.ok) break;
        
        lastError = await response.text();
        console.error(`AI enhancement attempt ${attempt + 1} failed:`, response.status, lastError);
        
        // Don't retry on payment/auth errors
        if (response.status === 402 || response.status === 403) break;
        
        // Wait before retry with exponential backoff
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 3000));
        }
      } catch (fetchError) {
        console.error(`AI fetch attempt ${attempt + 1} error:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError.message : "Network error";
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 3000));
        }
      }
    }

    if (!response || !response.ok) {
      console.error("AI enhancement failed after retries:", lastError);
      
      if (response?.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response?.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. AI service unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error after retries: ${lastError}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received, parsing JSON...");

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const result = JSON.parse(jsonContent);

      // Ensure all required fields exist with defaults
      let enhancedResult = {
        enhancedContent: result.enhancedContent || resumeText,
        contentImprovements: result.contentImprovements || [],
        addedKeywords: result.addedKeywords || missingKeywords || [],
        quantifiedAchievements: result.quantifiedAchievements || [],
        actionVerbUpgrades: result.actionVerbUpgrades || [],
        summaryRewrite: result.summaryRewrite || "",
        bulletPointImprovements: result.bulletPointImprovements || [],
        transformationNotes: result.transformationNotes || "",
      };

      // CRITICAL: Validate that enhanced content contains all companies from original
      // Extract likely company names from original resume (lines with Inc, Corp, LLC, etc. or known patterns)
      const companyPatterns = /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*)\s*(?:Inc\.?|Corp\.?|LLC|Ltd\.?|Bank|Group|Company|Co\.?|Technologies|Solutions)\b/gi;
      const originalCompanies: string[] = [];
      let match;
      while ((match = companyPatterns.exec(resumeText)) !== null) {
        const company = match[1].trim();
        if (company.length > 2 && !originalCompanies.includes(company)) {
          originalCompanies.push(company);
        }
      }
      
      // Also look for well-known companies without suffixes
      const wellKnownCompanies = ['Apple', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Facebook', 'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Twitter', 'LinkedIn', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'Adobe', 'Stripe', 'Shopify', 'Spotify', 'Snap', 'Pinterest', 'Reddit', 'Square', 'PayPal', 'Visa', 'Mastercard', 'JPMorgan', 'Goldman', 'Morgan Stanley', 'Deloitte', 'McKinsey', 'BCG', 'Bain', 'Accenture', 'KPMG', 'EY', 'PwC'];
      wellKnownCompanies.forEach(company => {
        const regex = new RegExp(`\\b${company}\\b`, 'i');
        if (regex.test(resumeText) && !originalCompanies.some(c => c.toLowerCase().includes(company.toLowerCase()))) {
          originalCompanies.push(company);
        }
      });

      if (originalCompanies.length > 0) {
        const missingCompanies = originalCompanies.filter(company => {
          const regex = new RegExp(company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          return !regex.test(enhancedResult.enhancedContent);
        });

        if (missingCompanies.length > 0) {
          console.log("[ENHANCE-RESUME] WARNING: Missing companies in enhanced content:", missingCompanies);
          console.log("[ENHANCE-RESUME] Original companies detected:", originalCompanies);
          
          // If companies are missing, fall back to original resume content but keep improvements
          console.log("[ENHANCE-RESUME] Falling back to original resume to preserve all experiences");
          enhancedResult.enhancedContent = resumeText;
          enhancedResult.transformationNotes = (enhancedResult.transformationNotes || "") + 
            " Note: Enhanced version preserved original resume structure to ensure all experiences were maintained.";
        }
      }

      // If the model returned an overly short change list, ask once more for an expanded bullet-level diff.
      if (enhancedResult.contentImprovements.length < 8) {
        console.log(
          "[ENHANCE-RESUME] contentImprovements too short, requesting expanded list:",
          enhancedResult.contentImprovements.length,
        );

        try {
          const followupSystemPrompt = `You are an expert resume editor. Return ONLY valid JSON with this structure:
{ "contentImprovements": [{ "section": string, "original": string, "improved": string, "reason": string }] }

CRITICAL RULES:
- Provide a BULLET-LEVEL list of changes (aim for 15-30 items for a typical resume).
- Include multiple items per company/role (not 1 summary per job).
- "original" MUST be the EXACT bullet point TEXT or sentence from the ORIGINAL resume - NOT the job title, company name, or section header. Copy the actual description/achievement text verbatim.
- "improved" MUST be the corresponding rewritten bullet point from the REWRITTEN resume.
- "section" should be "Experience - [Company]" (or "Professional Summary", "Skills", etc.).
- NEVER put job titles or role names in the "original" field - only the descriptive content/bullets.
- Example of WRONG: { "original": "Senior Product Manager at Google" } - this is a title, not content.
- Example of CORRECT: { "original": "Led cross-functional team to deliver product features" } - this is actual bullet content.`;

          const followupUserPrompt = `Create an expanded bullet-level change list by comparing the ORIGINAL resume to the REWRITTEN resume.

=== ORIGINAL RESUME ===
${resumeText}

=== REWRITTEN RESUME ===
${enhancedResult.enhancedContent}`;

          const followup = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: followupSystemPrompt },
                { role: "user", content: followupUserPrompt },
              ],
            }),
          });

          if (followup.ok) {
            const followupData = await followup.json();
            const followupContent = followupData.choices?.[0]?.message?.content || "";

            let followupJson = followupContent;
            const followupMatch = followupContent.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (followupMatch) followupJson = followupMatch[1].trim();

            const expanded = JSON.parse(followupJson);
            const expandedList = Array.isArray(expanded?.contentImprovements)
              ? expanded.contentImprovements
              : [];

            if (expandedList.length > enhancedResult.contentImprovements.length) {
              enhancedResult.contentImprovements = expandedList;
            }
          } else {
            console.log("[ENHANCE-RESUME] followup generation failed", followup.status);
          }
        } catch (e) {
          console.log("[ENHANCE-RESUME] followup parse/generation failed", e);
        }
      }

      return new Response(JSON.stringify(enhancedResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("JSON parse error, returning raw content");
      
      // Fallback if JSON parsing fails
      return new Response(JSON.stringify({
        enhancedContent: content,
        contentImprovements: [],
        addedKeywords: missingKeywords || [],
        quantifiedAchievements: [],
        actionVerbUpgrades: [],
        summaryRewrite: "",
        bulletPointImprovements: [],
        transformationNotes: "AI returned unstructured content - showing raw transformation.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in enhance-resume:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
