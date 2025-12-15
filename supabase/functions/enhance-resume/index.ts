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
    const { resumeText, jobDescription, selfProjection, missingKeywords, improvements, experienceGaps } = await req.json();

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

    const systemPrompt = `You are an expert resume writer, personal branding specialist, and ATS optimization expert. Your job is to transform resumes to pass ATS systems, impress hiring managers, and authentically represent the candidate's professional identity.

CRITICAL RULES:
1. Add missing keywords naturally into the content - don't just list them
2. Quantify EVERY achievement with specific numbers, percentages, or dollar amounts
3. Use strong action verbs that demonstrate leadership and impact
4. Structure bullet points as: [Action Verb] + [What you did] + [Result/Impact with numbers]
5. Make the summary/objective specifically target the job description
6. Ensure all improvements sound natural, not keyword-stuffed
7. MOST IMPORTANTLY: Incorporate the candidate's self-projection to make the resume authentic and personalized. Their voice, strengths, and desired perception should shine through.

Return your response as valid JSON with this exact structure:
{
  "enhancedContent": "The full enhanced resume in markdown format",
  "contentImprovements": [
    {
      "section": "Section name (e.g., Experience, Summary)",
      "original": "Original text that was changed",
      "improved": "New improved text",
      "reason": "Why this change improves ATS score and appeal"
    }
  ],
  "addedKeywords": ["keyword1", "keyword2"],
  "quantifiedAchievements": ["Achievement 1 with numbers", "Achievement 2 with metrics"],
  "actionVerbUpgrades": [
    {"original": "helped", "improved": "spearheaded"}
  ],
  "summaryRewrite": "The new professional summary",
  "bulletPointImprovements": ["Improved bullet 1", "Improved bullet 2"]
}`;

    const userPrompt = `Transform this resume to maximize ATS score and hiring manager appeal for the target role. Make it authentically represent the candidate.

ORIGINAL RESUME:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:
${jobDescription}` : ''}

${selfProjection ? `CANDIDATE'S SELF-PROJECTION (USE THIS TO PERSONALIZE THE RESUME):
The candidate wants to be perceived as: "${selfProjection}"

IMPORTANT: Use this self-projection to:
- Craft a professional summary that reflects their identity and desired perception
- Choose language and framing that matches how they see themselves
- Highlight achievements that align with their stated strengths
- Make the resume feel authentic to who they are, not generic` : ''}

${missingKeywords?.length > 0 ? `MISSING KEYWORDS TO ADD (integrate naturally):
${missingKeywords.join(', ')}` : ''}

${improvements?.length > 0 ? `SPECIFIC IMPROVEMENTS NEEDED:
${improvements.map((imp: any) => `- ${imp.issue}: ${imp.fix}`).join('\n')}` : ''}

${experienceGaps?.length > 0 ? `EXPERIENCE GAPS TO ADDRESS:
${experienceGaps.join('\n')}` : ''}

CRITICAL INSTRUCTIONS:
- Rewrite the professional summary to directly address the job requirements AND reflect the candidate's self-projection
- For EVERY bullet point, add specific metrics (e.g., "increased by 40%", "saved $50K", "managed team of 8")
- Replace weak verbs with powerful action verbs
- Naturally incorporate ALL missing keywords
- Make achievements outcome-focused, not task-focused
- The resume should feel personal and authentic to this specific candidate
- Keep the resume concise but impactful

Return the enhanced resume as JSON with the structure specified.`;

    console.log("Calling Lovable AI for resume enhancement...");

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
