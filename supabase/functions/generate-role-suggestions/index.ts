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
    const { 
      roleTitle,
      company,
      location,
      dates,
      responsibilities,
      targetRoles,
      targetIndustries,
      careerGoals,
      jobDescription
    } = await req.json();

    if (!roleTitle || !responsibilities || responsibilities.length === 0) {
      return new Response(JSON.stringify({ error: "Role title and responsibilities are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert executive resume writer and career coach with 20+ years of experience placing senior professionals at Fortune 500 companies. Your task is to analyze a specific work experience role and provide actionable, specific suggestions to optimize it.

You will analyze the role and provide suggestions in these categories:
1. IMPACT & METRICS - Where quantifiable results are missing or weak
2. SENIORITY & LEADERSHIP - Where language doesn't match executive level  
3. KEYWORDS & ATS - Industry terms and keywords that should be added
4. CLARITY & REDUNDANCY - Overly long or unclear bullets to simplify

For each suggestion:
- Be SPECIFIC to the actual bullet text (reference by number)
- Provide the EXACT wording change, not generic advice
- Explain WHY this change matters for their career goals
- Focus on what will make the biggest difference

Also provide optimized versions of each responsibility bullet that incorporate best practices.`;

    const userPrompt = `Analyze this work experience role and provide specific AI-powered suggestions:

=== ROLE INFORMATION ===
Title: ${roleTitle}
Company: ${company || 'Not specified'}
Location: ${location || 'Not specified'}
Dates: ${dates || 'Not specified'}

=== CURRENT RESPONSIBILITIES ===
${responsibilities.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

${targetRoles?.length > 0 ? `=== TARGET ROLES ===
${targetRoles.join(', ')}` : ''}

${targetIndustries?.length > 0 ? `=== TARGET INDUSTRIES ===
${targetIndustries.join(', ')}` : ''}

${careerGoals ? `=== CAREER GOALS ===
${careerGoals}` : ''}

${jobDescription ? `=== TARGET JOB DESCRIPTION ===
${jobDescription}` : ''}

=== YOUR TASK ===
Analyze each bullet point and provide:

1. Specific suggestions grouped by category (impact_gap, language_seniority, keyword_optimization, clarity_redundancy)
2. Optimized versions of ALL responsibility bullets

Return as JSON with this structure:
{
  "suggestions": [
    {
      "id": "sug-1",
      "type": "impact_gap" | "language_seniority" | "keyword_optimization" | "clarity_redundancy",
      "bulletIndex": 0,
      "suggestion": "Specific action: Add revenue impact to bullet #1 - change 'managed product' to 'Drove $2M+ product portfolio...'",
      "reason": "Revenue metrics are critical for senior PM roles and currently missing",
      "accepted": false
    }
  ],
  "optimizedResponsibilities": [
    "Completely rewritten bullet 1 with metrics, strong verbs, and keywords",
    "Completely rewritten bullet 2..."
  ],
  "roleSummary": "Brief 1-2 sentence summary of how this role should be positioned for target goals"
}

CRITICAL:
- Provide 6-12 specific suggestions across all categories
- Each suggestion must reference specific bullet numbers or specific text
- Optimized bullets must be COMPLETELY REWRITTEN with metrics (estimate if needed)
- Focus on what will have the biggest impact for their stated career goals`;

    console.log("Calling Lovable AI for role-specific suggestions...");

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsedResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return fallback structure
      parsedResult = {
        suggestions: [
          {
            id: "sug-1",
            type: "impact_gap",
            suggestion: "Add quantifiable metrics to demonstrate business impact",
            reason: "Metrics help recruiters quickly assess your value",
            accepted: false
          },
          {
            id: "sug-2",
            type: "keyword_optimization",
            suggestion: "Include industry-specific keywords for ATS optimization",
            reason: "ATS systems scan for specific terminology",
            accepted: false
          }
        ],
        optimizedResponsibilities: responsibilities,
        roleSummary: "Role analysis in progress - AI optimization available"
      };
    }

    // Ensure all suggestions have required fields
    const validatedSuggestions = (parsedResult.suggestions || []).map((sug: any, idx: number) => ({
      id: sug.id || `sug-${idx}`,
      type: sug.type || "impact_gap",
      bulletIndex: sug.bulletIndex,
      suggestion: sug.suggestion || "Optimization suggestion",
      reason: sug.reason,
      accepted: false
    }));

    console.log(`Generated ${validatedSuggestions.length} suggestions for ${roleTitle} at ${company}`);

    return new Response(JSON.stringify({
      suggestions: validatedSuggestions,
      optimizedResponsibilities: parsedResult.optimizedResponsibilities || responsibilities,
      roleSummary: parsedResult.roleSummary || ""
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating role suggestions:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate suggestions" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
