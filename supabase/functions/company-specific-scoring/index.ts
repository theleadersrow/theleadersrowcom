import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, evaluations, categoryScores, companyProfile, answers } = await req.json();
    
    console.log(`Generating company-specific scoring for ${companyProfile.display_name}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const weights = companyProfile.category_weights || {};
    
    // Recompute weighted scores based on company priorities
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const adjustedCategoryScores: Record<string, any> = {};
    
    for (const catScore of categoryScores) {
      const weight = weights[catScore.category] || 1.0;
      const adjustedScore = catScore.score_0_100 * weight;
      adjustedCategoryScores[catScore.category] = {
        original_score: catScore.score_0_100,
        weight: weight,
        weighted_score: Math.round(adjustedScore),
        importance: weight > 1.1 ? 'critical' : weight < 0.9 ? 'less_important' : 'standard'
      };
      totalWeightedScore += adjustedScore;
      totalWeight += weight;
    }
    
    const companyAdjustedOverall = Math.round(totalWeightedScore / totalWeight);

    // Generate company-specific feedback
    const answerSummary = answers.slice(0, 5).map((a: any) => 
      `${a.question?.category}: ${a.answer_text?.substring(0, 200)}...`
    ).join('\n');

    const feedbackPrompt = `You are a ${companyProfile.display_name} interviewer evaluating a PM candidate.

COMPANY CULTURE:
- Core Values: ${companyProfile.core_values?.join(', ')}
- Preferred Style: ${companyProfile.preferred_answer_style}
- Common Red Flags: ${companyProfile.common_red_flags?.join(', ')}
- Bar Raiser Expectations: ${companyProfile.bar_raiser_expectations}

CANDIDATE PERFORMANCE:
Overall Adjusted Score: ${companyAdjustedOverall}/100

Category Performance (weighted for ${companyProfile.display_name}):
${Object.entries(adjustedCategoryScores).map(([cat, data]: [string, any]) => 
  `- ${cat}: ${data.weighted_score}/100 (${data.importance})`
).join('\n')}

Sample Answers:
${answerSummary}

Provide company-specific feedback as JSON:
{
  "company_fit_score": 0-100,
  "culture_alignment": "strong" | "moderate" | "weak",
  "top_culture_matches": ["value they demonstrated well"],
  "culture_gaps": ["values they didn't demonstrate"],
  "red_flags_triggered": ["any red flags from the list"],
  "specific_feedback": "2-3 sentences as a ${companyProfile.display_name} interviewer would write",
  "interview_tips": ["1-2 tips specific to ${companyProfile.display_name} interviews"],
  "would_pass_bar": true | false,
  "reasoning": "one sentence why"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are an experienced ${companyProfile.display_name} interviewer. Return only valid JSON.` },
          { role: "user", content: feedbackPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    let companyFeedback = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        companyFeedback = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse company feedback:", e);
      }
    }

    return new Response(JSON.stringify({
      company: companyProfile.display_name,
      adjusted_overall_score: companyAdjustedOverall,
      category_breakdown: adjustedCategoryScores,
      feedback: companyFeedback
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Company-specific scoring error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
