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
    const { linkedinUrl, targetIndustry, targetRole, profileText, resumeText, requestType } = await req.json();
    
    console.log("LinkedIn analysis request:", { linkedinUrl, targetIndustry, targetRole, requestType, hasResume: !!resumeText });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (requestType === "score") {
      // Initial scoring analysis
      const systemPrompt = `You are an expert LinkedIn profile analyst and recruiter. Analyze LinkedIn profiles from the perspective of recruiters and hiring managers in the ${targetIndustry} industry looking for ${targetRole} candidates.

Score profiles on these dimensions (0-100):
1. Headline Clarity: Does the headline clearly communicate their value proposition and role?
2. Role Positioning: Is their experience positioned to match ${targetRole} responsibilities?
3. Impact Language: Do they use quantified achievements and outcome-focused language?
4. Leadership Signal: Do they demonstrate leadership, influence, and strategic thinking?
5. Industry Alignment: Is their profile optimized for the ${targetIndustry} industry?
6. Visibility Score: How likely is this profile to appear in recruiter searches?

Return your analysis as valid JSON with this exact structure:
{
  "overallScore": <number 0-100>,
  "dimensions": {
    "headlineClarity": { "score": <number>, "analysis": "<brief analysis>" },
    "rolePositioning": { "score": <number>, "analysis": "<brief analysis>" },
    "impactLanguage": { "score": <number>, "analysis": "<brief analysis>" },
    "leadershipSignal": { "score": <number>, "analysis": "<brief analysis>" },
    "industryAlignment": { "score": <number>, "analysis": "<brief analysis>" },
    "visibilityScore": { "score": <number>, "analysis": "<brief analysis>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalGaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recruiterPerspective": "<What a recruiter searching for ${targetRole} in ${targetIndustry} would think seeing this profile>"
}`;

      const userPrompt = `Analyze this LinkedIn profile for someone targeting a ${targetRole} role in ${targetIndustry}:

LinkedIn URL: ${linkedinUrl}
Profile Content:
${profileText}

Provide a comprehensive scoring analysis.`;

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
        throw new Error("Failed to analyze LinkedIn profile");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse analysis response");
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      console.log("LinkedIn score analysis complete:", analysis.overallScore);

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (requestType === "improve") {
      // AI improvement suggestions - enhanced with resume context
      const resumeContext = resumeText 
        ? `\n\nIMPORTANT: The user has also provided their resume. Use the resume to:
1. Pull specific achievements, metrics, and outcomes from their work history
2. Identify strong bullet points that can be adapted for LinkedIn
3. Find quantified results and leadership examples from their actual experience
4. Ensure suggestions are authentic to their real career history

RESUME CONTENT:
${resumeText}` 
        : "";

      const systemPrompt = `You are an expert LinkedIn profile optimizer and career coach. Your job is to provide specific, actionable suggestions to improve a LinkedIn profile for someone targeting ${targetRole} positions in ${targetIndustry}.

Focus on:
1. OUTCOME-FOCUSED CONTENT: Transform generic descriptions into quantified achievements
2. KEYWORD OPTIMIZATION: Add industry and role-specific keywords that recruiters search for
3. HEADLINE REWRITE: Create a compelling headline that positions them for ${targetRole}
4. ABOUT SECTION: Craft a powerful summary that tells their career story
5. EXPERIENCE BULLETS: Rewrite key bullets with STAR format and metrics${resumeText ? " - USE THE RESUME to pull real achievements and metrics" : ""}

Return your suggestions as valid JSON with this exact structure:
{
  "suggestedHeadline": "<new headline optimized for ${targetRole}>",
  "suggestedAbout": "<2-3 paragraph about section>",
  "keywordAdditions": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "experienceRewrites": [
    {
      "original": "<original bullet or section>",
      "improved": "<rewritten with metrics and impact${resumeText ? " - incorporate specific achievements from resume" : ""}>",
      "whyBetter": "<explanation>"
    }
  ],
  "skillsToAdd": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "projectedScoreIncrease": {
    "headlineClarity": <points increase>,
    "rolePositioning": <points increase>,
    "impactLanguage": <points increase>,
    "leadershipSignal": <points increase>,
    "industryAlignment": <points increase>,
    "visibilityScore": <points increase>,
    "projectedOverallScore": <new projected overall score>
  },
  "priorityActions": [
    { "action": "<specific action>", "impact": "high|medium", "timeToComplete": "<time estimate>" }
  ]
}`;

      const userPrompt = `Provide specific improvement suggestions for this LinkedIn profile. The person is targeting a ${targetRole} role in ${targetIndustry}.

Current LinkedIn Profile:
${profileText}${resumeContext}

Provide detailed, specific suggestions that will significantly improve their profile visibility and appeal to recruiters.${resumeText ? " Make sure to leverage their actual resume achievements in your experience rewrites." : ""}`;

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
        throw new Error("Failed to generate improvement suggestions");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse suggestions response");
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      console.log("LinkedIn improvement suggestions complete");

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid request type");

  } catch (error) {
    console.error("Error in analyze-linkedin function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
