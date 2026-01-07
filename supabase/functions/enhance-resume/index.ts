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
    const { 
      resumeText, 
      jobDescription, 
      // Section 1: Targeting & Intent
      targetRoles,
      targetIndustries,
      companyTypes,
      primaryOutcomes,
      // Section 2: Role Scope & Seniority
      roleScopes,
      strategyOrExecution,
      stakeholders,
      crossFunctionalLead,
      seniorityDescription,
      // Section 3: Impact & Metrics
      strongestImpact,
      measurableOutcomes,
      metricsMissingReason,
      bestImpactProject,
      underrepresentedAchievement,
      // Section 4: Professional Brand (Optional)
      recruiterPerception,
      professionalSkills,
      stretchingLevel,
      overstatingCaution,
      // Section 5: Practical Constraints (Optional)
      deemphasizeCompanies,
      gapsOrTransitions,
      complianceConstraints,
      // ATS data
      missingKeywords, 
      improvements, 
      experienceGaps, 
      skillsGaps, 
      techStackGaps, 
      email, 
      accessToken 
    } = await req.json();

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

    const systemPrompt = `You are an expert executive resume writer with 20+ years placing candidates at Fortune 500 companies. Your job is to OPTIMIZE AND ENHANCE the resume while preserving the candidate's authentic experience.

===== CRITICAL RULES =====
1. DO NOT FABRICATE OR INVENT METRICS. If the original resume doesn't have specific numbers, do NOT add made-up percentages or dollar amounts.
2. Only add metrics if the candidate explicitly provided them in clarifying questions or if they are reasonable inferences from the original text.
3. PRESERVE all original sections including CERTIFICATIONS, COURSES, EDUCATION exactly as they appear - do not omit or modify factual information.
4. Focus on improving language, action verbs, and alignment with target role WITHOUT inventing achievements.

===== TRANSFORMATION APPROACH =====
For each experience bullet:
1. Identify the core achievement/responsibility
2. REFRAME using stronger action verbs aligned with the target role
3. ONLY add metrics if they were in the original OR explicitly provided by the user
4. ALIGN LANGUAGE with job description terminology
5. EMPHASIZE aspects relevant to the target role

===== WHAT TO DO =====
GOOD: "Managed product development lifecycle" → "Led end-to-end product lifecycle, driving cross-functional alignment and accelerating delivery"
GOOD: "Worked with team to deliver features" → "Spearheaded feature delivery across cross-functional teams, improving product quality"

===== WHAT NOT TO DO =====
BAD: Adding "**$2M revenue**" when original had no revenue numbers
BAD: Adding "**40% improvement**" when original had no percentages
BAD: Inventing team sizes like "**12-person team**" when not stated
BAD: Omitting CERTIFICATIONS, COURSES, or EDUCATION sections

===== RESUME FORMATTING CONTRACT (HARD RULES) =====
This resume MUST follow a strict, executive, single-column layout.

This resume must:
- Be professionally rewritten - not the original with minor edits
- Look like a clean executive resume (not AI text)
- Be scannable in 6–8 seconds
- Be ATS-safe

DO NOT:
- Fabricate metrics or numbers not in the original
- Omit any sections from the original resume (CERTIFICATIONS, COURSES, EDUCATION, etc.)
- Use tables, columns, icons, emojis, or graphics
- Change section order dramatically

===== SECTION STYLE RULES =====
- Section headers must be ALL CAPS
- Section headers must be left-aligned
- One blank line after each section header
- Bullet points only in Experience sections
- Bold metrics ONLY if they exist in original or were provided by user

===== SECTION ORDER (PRESERVE ORIGINAL) =====
Preserve the original resume's section order. Common sections include:
1. SUMMARY / PROFESSIONAL SUMMARY
2. KEY ACHIEVEMENTS (if present)
3. EXPERIENCE / WORK EXPERIENCE
4. EDUCATION
5. CERTIFICATIONS (preserve exactly if present)
6. COURSES / PROFESSIONAL DEVELOPMENT (preserve exactly if present)
7. SKILLS / INDUSTRY EXPERTISE

===== SECTION FORMATS =====

SUMMARY:
- Single paragraph, 4-5 lines max
- Professionally rewritten to target the specific role
- Senior, outcome-driven tone
- Do NOT use first person or buzzwords without outcomes

KEY ACHIEVEMENTS:
- 4 achievement blocks if present in original
- Each block: Short bolded headline, then one sentence explanation
- Only include metrics if they were in the original

EXPERIENCE:
For EACH role, use this format:
ROLE TITLE
Company Name
City, State | MM/YYYY – MM/YYYY (or Present)

• Enhanced scope statement
• Reframed action → Outcome
• Use metrics ONLY if in original
(max 8 bullets per role)

EDUCATION:
Preserve exactly as provided. Format:
DEGREE
University Name

CERTIFICATIONS:
Preserve exactly as provided. List each certification on its own line.

COURSES:
Preserve exactly as provided.

SKILLS / INDUSTRY EXPERTISE:
Single line, pipe-separated categories. Max 6 categories.

===== CRITICAL RULES =====
- PRESERVE actual job titles, company names, employment dates, education, certifications, courses
- DO NOT add made-up metrics or numbers
- REFRAME experience to match target job language
- Match language to job description terminology
- INCLUDE ALL SECTIONS from original resume

Return your response as valid JSON with this structure:
{
  "enhancedContent": "THE COMPLETE OPTIMIZED RESUME - professionally enhanced while preserving authenticity.",
  "contentImprovements": [
    {"section": "Experience - Company Name", "original": "exact original bullet", "improved": "enhanced bullet (no made-up metrics)", "reason": "why this targets the job better"}
  ],
  "addedKeywords": ["keywords naturally woven in"],
  "quantifiedAchievements": ["Achievement statements (only metrics from original or user input)"],
  "actionVerbUpgrades": [{"original": "weak verb", "improved": "strong verb"}],
  "summaryRewrite": "The new professional summary",
  "transformationNotes": "Brief explanation of transformation strategy"
}

CRITICAL REQUIREMENTS:
1. Include ALL sections from original resume (especially CERTIFICATIONS, COURSES, EDUCATION)
2. DO NOT fabricate metrics or numbers
3. Preserve the candidate's authentic experience
4. Focus on language improvement and role alignment`;
    const userPrompt = `Optimize this resume for better job alignment while preserving the candidate's authentic experience.

CRITICAL: DO NOT invent metrics, percentages, or numbers that don't exist in the original resume.

=== ORIGINAL RESUME (ENHANCE BUT PRESERVE AUTHENTICITY) ===
${resumeText}

${jobDescription ? `=== TARGET JOB DESCRIPTION (ALIGN LANGUAGE TO THIS) ===
${jobDescription}

IMPORTANT: Align the resume language, skills emphasis, and achievement framing to match what this job is looking for. Use their actual experience but position it for THIS role. DO NOT invent numbers or metrics.` : ''}

=== TARGETING & INTENT ===
${targetRoles?.length > 0 ? `Target Roles: ${targetRoles.join(', ')}
Use language and framing that matches ${targetRoles.join('/')} expectations.` : ''}
${targetIndustries?.length > 0 ? `Target Industries: ${targetIndustries.join(', ')}
Use terminology relevant to ${targetIndustries.join('/')} industries.` : ''}
${companyTypes?.length > 0 ? `Company Types: ${companyTypes.join(', ')}
Tailor language to appeal to ${companyTypes.join('/')} companies.` : ''}
${primaryOutcomes?.length > 0 ? `Key Outcomes to Communicate: ${primaryOutcomes.join(', ')}` : ''}

=== ROLE SCOPE & SENIORITY ===
${roleScopes?.length > 0 ? `Role Scope Experience: ${roleScopes.map((r: string) => r === 'ic' ? 'Individual Contributor' : r === 'lead_ic' ? 'Lead IC' : r === 'manager' ? 'People Manager' : 'Hybrid (IC + Manager)').join(', ')}` : ''}
${strategyOrExecution ? `Owned: ${strategyOrExecution === 'strategy' ? 'Strategy only' : strategyOrExecution === 'execution' ? 'Execution only' : 'Both strategy and execution'}` : ''}
${stakeholders?.length > 0 ? `Stakeholders Influenced: ${stakeholders.join(', ')}` : ''}
${crossFunctionalLead ? `Cross-Functional Leadership: ${crossFunctionalLead === 'yes_major' ? 'Yes - major initiatives' : crossFunctionalLead === 'yes_limited' ? 'Yes - limited' : 'No'}` : ''}
${seniorityDescription ? `Self-Described Seniority: "${seniorityDescription}"` : ''}

=== IMPACT & METRICS (USE ONLY IF PROVIDED) ===
${strongestImpact?.length > 0 ? `Strongest Impact Areas: ${strongestImpact.join(', ')}` : ''}
${measurableOutcomes?.length > 0 ? `Available Metrics Types the candidate CAN share: ${measurableOutcomes.join(', ')}` : ''}
${metricsMissingReason ? `Why Metrics May Be Missing: ${metricsMissingReason} - DO NOT fabricate metrics if this is the case.` : ''}
${bestImpactProject ? `Best Impact Project: "${bestImpactProject}"
This project should be highlighted prominently.` : ''}
${underrepresentedAchievement ? `Underrepresented Achievement to Highlight: "${underrepresentedAchievement}"` : ''}

${recruiterPerception?.length > 0 || professionalSkills?.length > 0 ? `=== PROFESSIONAL BRAND ===
${recruiterPerception?.length > 0 ? `Desired Perception: ${recruiterPerception.join(', ')}` : ''}
${professionalSkills?.length > 0 ? `Core Professional Skills: ${professionalSkills.join(', ')}` : ''}
${stretchingLevel ? `Aiming for Higher Level: ${stretchingLevel}` : ''}
${overstatingCaution ? `CAUTION - Do NOT overstate: "${overstatingCaution}"` : ''}` : ''}

${deemphasizeCompanies || gapsOrTransitions !== 'no' ? `=== PRACTICAL CONSTRAINTS ===
${deemphasizeCompanies ? `De-emphasize: "${deemphasizeCompanies}"` : ''}
${gapsOrTransitions && gapsOrTransitions !== 'no' ? `Handle Carefully: ${gapsOrTransitions === 'career_gap' ? 'Career gap' : 'Role change transition'}` : ''}
${complianceConstraints === 'yes' ? `Note: Compliance/confidentiality constraints apply - be careful with specific numbers` : ''}` : ''}

${missingKeywords?.length > 0 ? `=== KEYWORDS TO INTEGRATE (WHERE AUTHENTIC) ===
Naturally weave in where the candidate has relevant experience:
${missingKeywords.join(', ')}` : ''}

${skillsGaps?.length > 0 ? `=== SKILL GAPS TO ADDRESS ===
Where the candidate has related/transferable experience, reframe:
${skillsGaps.map((gap: any) => `- ${gap.skill}: ${gap.gap}`).join('\n')}` : ''}

${improvements?.length > 0 ? `=== SPECIFIC IMPROVEMENTS NEEDED ===
${improvements.map((imp: any) => `- ${imp.issue}: ${imp.fix}`).join('\n')}` : ''}

=== YOUR TASK ===
Generate an optimized resume that:
1. PRESERVES all sections from the original (including CERTIFICATIONS, COURSES, EDUCATION)
2. IMPROVES language and action verbs
3. ALIGNS with the target role
4. DOES NOT fabricate metrics or numbers
5. Keeps the candidate's authentic experience

Format with ALL CAPS section headers. Include all original sections.

Return as JSON with the specified structure.`;

    console.log("Calling Lovable AI for resume optimization...");

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

    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("AI returned empty response");
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("AI service returned invalid response. Please try again.");
    }
    
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("AI response structure:", JSON.stringify(data).slice(0, 500));
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

      // Validate that enhanced content exists and is meaningfully different
      if (!result.enhancedContent || result.enhancedContent.trim().length < 500) {
        throw new Error("AI did not generate valid enhanced content");
      }

      // Ensure all required fields exist with defaults - NEVER fall back to original resume
      let enhancedResult = {
        enhancedContent: result.enhancedContent, // No fallback to original!
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
          
          // Log warning but DON'T fall back to original - the rewritten content is still valuable
          // The AI may have rewritten company names slightly or the regex may not match
          enhancedResult.transformationNotes = (enhancedResult.transformationNotes || "") + 
            ` Note: Some company names may need verification: ${missingCompanies.join(', ')}. Please review the Experience section.`;
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
