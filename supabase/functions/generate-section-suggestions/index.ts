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
      sectionTitle,
      sectionType,
      originalContent,
      improvedContent,
      targetRoles,
      targetIndustries,
      careerGoals,
      jobDescription
    } = await req.json();

    if (!sectionTitle || !originalContent) {
      return new Response(JSON.stringify({ error: "Section title and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build section-specific prompts
    const sectionPrompts: Record<string, string> = {
      header: `Analyze this resume HEADER section. Focus on:
- Professional title optimization for target roles
- Contact information completeness
- Personal branding statement
- ATS-friendly formatting`,
      summary: `Analyze this PROFESSIONAL SUMMARY. Focus on:
- Opening hook and value proposition
- Alignment with target role level
- Key achievements and scope
- Industry-specific keywords
- Length optimization (should be 3-5 impactful sentences)`,
      education: `Analyze this EDUCATION section. Focus on:
- Degree presentation and formatting
- Relevant coursework or honors
- Certifications placement
- Date formatting consistency`,
      skills: `Analyze this SKILLS/EXPERTISE section. Focus on:
- Keyword optimization for ATS
- Skill categorization and grouping
- Alignment with target job requirements
- Removing outdated or irrelevant skills`,
      achievements: `Analyze this KEY ACHIEVEMENTS section. Focus on:
- Impact quantification (metrics, percentages, dollar amounts)
- Action verb strength
- Result-oriented framing
- Relevance to target role`,
      other: `Analyze this resume section. Focus on:
- Content relevance and impact
- Keyword optimization
- Formatting consistency
- Professional tone`
    };

    const systemPrompt = `You are an expert executive resume writer with 20+ years placing candidates at Fortune 500 companies. You specialize in optimizing specific resume sections for maximum impact and ATS compatibility.

Your task is to analyze a specific resume section and provide:
1. Specific, actionable suggestions for improvement
2. A fully optimized version of the content

For each suggestion:
- Be SPECIFIC to the actual content
- Provide the EXACT wording change recommended
- Explain WHY this change improves the resume
- Focus on what will make the biggest difference`;

    const userPrompt = `${sectionPrompts[sectionType] || sectionPrompts.other}

=== SECTION: ${sectionTitle} ===
${originalContent}

${improvedContent ? `=== CURRENT AI-IMPROVED VERSION ===
${improvedContent}` : ''}

${targetRoles?.length > 0 ? `=== TARGET ROLES ===
${targetRoles.join(', ')}` : ''}

${targetIndustries?.length > 0 ? `=== TARGET INDUSTRIES ===
${targetIndustries.join(', ')}` : ''}

${careerGoals ? `=== CAREER GOALS ===
${careerGoals}` : ''}

${jobDescription ? `=== TARGET JOB DESCRIPTION ===
${jobDescription}` : ''}

=== YOUR TASK ===
Provide:
1. 4-8 specific suggestions for improving this section
2. A fully optimized version of the content

Return as JSON:
{
  "suggestions": [
    {
      "id": "sug-1",
      "type": "content_improvement" | "keyword_optimization" | "formatting" | "impact_enhancement" | "clarity",
      "suggestion": "Specific action to take",
      "reason": "Why this matters for their career goals",
      "accepted": false
    }
  ],
  "optimizedContent": "The fully rewritten/optimized section content with **bolded metrics** where applicable"
}

CRITICAL:
- Each suggestion must be specific and actionable
- The optimizedContent should be a complete, ready-to-use version
- Use **bold markers** around key metrics and achievements
- Align all improvements with the candidate's stated goals`;

    console.log(`Generating suggestions for ${sectionType}: ${sectionTitle}`);

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

    // Parse JSON from response
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
            type: "content_improvement",
            suggestion: "Review and optimize this section for your target role",
            reason: "Ensure alignment with career goals",
            accepted: false
          }
        ],
        optimizedContent: improvedContent || originalContent
      };
    }

    // Validate suggestions
    const validatedSuggestions = (parsedResult.suggestions || []).map((sug: any, idx: number) => ({
      id: sug.id || `sug-${idx}`,
      type: sug.type || "content_improvement",
      suggestion: sug.suggestion || "Optimization suggestion",
      reason: sug.reason,
      accepted: false
    }));

    console.log(`Generated ${validatedSuggestions.length} suggestions for ${sectionTitle}`);

    return new Response(JSON.stringify({
      suggestions: validatedSuggestions,
      optimizedContent: parsedResult.optimizedContent || improvedContent || originalContent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating section suggestions:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate suggestions" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
