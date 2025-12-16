import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription, selfProjection, missingKeywords, improvements, experienceGaps, skillsGaps, techStackGaps } = await req.json();

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
      "section": "Section name",
      "original": "Original text from their resume",
      "improved": "Your rewritten version",
      "reason": "Why this transformation better targets the job"
    }
  ],
  "addedKeywords": ["keywords that were naturally woven in"],
  "quantifiedAchievements": ["Achievement statements with specific numbers"],
  "actionVerbUpgrades": [{"original": "weak verb", "improved": "strong verb"}],
  "summaryRewrite": "The new professional summary",
  "transformationNotes": "Brief explanation of the overall transformation strategy used"
}`;

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
2. REWRITE EVERY BULLET POINT to be achievement-focused with metrics
3. REORGANIZE skills to prioritize job-relevant ones
4. NATURALLY INTEGRATE all missing keywords into actual content
5. REFRAME experience to highlight transferable skills for any gaps

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
