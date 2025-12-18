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

    const systemPrompt = `You are an expert resume writer, personal branding specialist, and ATS optimization expert with 20+ years of experience placing candidates at Fortune 500 companies. Your job is to COMPLETELY REWRITE resumes to maximize ATS scores, impress hiring managers, and authentically represent the candidate's TRUE experience.

CRITICAL TRANSFORMATION RULES:
1. REWRITE THE ENTIRE RESUME - not just add keywords. Transform every section.
2. PRESERVE AUTHENTICITY - Keep the candidate's actual experience, companies, and dates. Don't invent new jobs or lie about experience.
3. REFRAME EXPERIENCE - Take their actual work and reframe it to align with the target job requirements. Same experience, better positioning.
4. QUANTIFY EVERYTHING - Add specific metrics, percentages, dollar amounts. If not provided, use realistic industry-standard estimates based on context.
5. MATCH LANGUAGE TO JOB - Use the exact terminology from the job description where it authentically applies to their experience.
6. STRATEGIC SUMMARY - Write a powerful professional summary that positions them as the ideal candidate.
7. BULLET TRANSFORMATION - Rewrite every bullet point to be achievement-focused with this structure: [Strong Action Verb] + [Specific Task] + [Quantified Result/Impact]

CRITICAL: ANALYZE AND IMPROVE ALL WORK EXPERIENCES
- You MUST provide contentImprovements for EVERY job/position in the resume, not just the most recent one
- Each work experience has value - older experiences often contain foundational skills and achievements
- Provide at least 2-3 improvements per job position in the resume

WHAT TO PRESERVE (NEVER CHANGE):
- Actual job titles (unless minor title optimization like "Engineer" to "Software Engineer")
- Company names
- Employment dates
- Education credentials
- Core responsibilities (just reframe them better)

WHAT TO TRANSFORM:
- Professional summary (completely rewrite to target the job)
- Bullet point wording (rewrite to be achievement-focused)
- Skills section (reorganize to prioritize job-relevant skills)
- Overall narrative flow and positioning

Return your response as valid JSON with this exact structure:
{
  "enhancedContent": "THE COMPLETE REWRITTEN RESUME - Full resume text ready to use. Format as clean text with clear section headers (PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS). This should be a fully usable resume document.",
  "contentImprovements": [
    {
      "section": "Section name with company (e.g., 'Experience - Google' or 'Professional Summary')",
      "original": "The EXACT original bullet point or paragraph from their resume",
      "improved": "Your rewritten version of that specific bullet/paragraph",
      "reason": "Why this transformation better targets the job"
    }
  ],
  "addedKeywords": ["keywords that were naturally woven in"],
  "quantifiedAchievements": ["Achievement statements with specific numbers"],
  "actionVerbUpgrades": [{"original": "weak verb", "improved": "strong verb"}],
  "summaryRewrite": "The new professional summary",
  "transformationNotes": "Brief explanation of the overall transformation strategy used"
}

CRITICAL REQUIREMENTS FOR contentImprovements:
1. Include EVERY SINGLE bullet point you improved from the resume - not a summary, but each individual change
2. For each job/position, include ALL bullet points that were changed (typically 3-5+ per job)
3. The "original" field must contain the EXACT text from the original resume
4. The "improved" field must contain your rewritten version
5. Include improvements from ALL work experiences, not just the most recent
6. Aim for 10-20+ contentImprovements entries for a typical resume
7. Label each improvement clearly with "Experience - [Company Name]" format`;

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

=== YOUR TASK ===
1. Write a NEW PROFESSIONAL SUMMARY that positions them as ideal for this role
2. REWRITE EVERY BULLET POINT across ALL work experiences to be achievement-focused with metrics
3. REORGANIZE skills to prioritize job-relevant ones
4. NATURALLY INTEGRATE all missing keywords into actual content
5. REFRAME experience to highlight transferable skills for any gaps

CRITICAL: In contentImprovements, you MUST include improvements from EVERY job/company listed in the resume. Do not only improve the most recent job - improve ALL experiences. Label each improvement with the company name (e.g., "Experience - Apple Inc", "Experience - RBC Bank").

The output "enhancedContent" must be the COMPLETE, READY-TO-USE resume - not a list of suggestions. Someone should be able to copy this and submit it directly.

Return the result as JSON with the specified structure.`;

    console.log("Calling Lovable AI for complete resume transformation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. AI service unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
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
      const enhancedResult = {
        enhancedContent: result.enhancedContent || resumeText,
        contentImprovements: result.contentImprovements || [],
        addedKeywords: result.addedKeywords || missingKeywords || [],
        quantifiedAchievements: result.quantifiedAchievements || [],
        actionVerbUpgrades: result.actionVerbUpgrades || [],
        summaryRewrite: result.summaryRewrite || "",
        bulletPointImprovements: result.bulletPointImprovements || [],
        transformationNotes: result.transformationNotes || "",
      };

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
