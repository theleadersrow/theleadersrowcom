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
    const { 
      sessionId, 
      overallScore, 
      categoryScores, 
      narrativeScore, 
      evaluations,
      targetLevel,
      committeeReviews 
    } = await req.json();
    
    console.log(`Generating career leverage analysis for session: ${sessionId}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const categoryBreakdown = categoryScores.map((c: any) => 
      `${c.category}: ${c.score_0_100}/100`
    ).join(', ');

    const leadershipSignals = evaluations.filter((e: any) => 
      e.level_calibration === 'above' || 
      (e.ownership_impact_1_5 || 0) >= 4
    ).length;

    const analysisPrompt = `You are a career strategist analyzing PM interview performance to provide career leverage insights.

PERFORMANCE DATA:
- Target Level: ${targetLevel}
- Overall Score: ${overallScore}/100
- Narrative Score: ${narrativeScore}/100
- Category Breakdown: ${categoryBreakdown}
- Leadership Signals Count: ${leadershipSignals}
- Total Answers: ${evaluations.length}
- Above Level Calibrations: ${evaluations.filter((e: any) => e.level_calibration === 'above').length}
- Below Level Calibrations: ${evaluations.filter((e: any) => e.level_calibration === 'below').length}

${committeeReviews ? `
COMMITTEE FEEDBACK:
${committeeReviews.map((r: any) => `${r.persona_name}: ${r.verdict}`).join('\n')}
` : ''}

Provide career leverage analysis as JSON:
{
  "recommended_level": "PM" | "Senior PM" | "Staff PM" | "Principal PM" | "GPM" | "Director",
  "current_level_assessment": "Where they're currently performing",
  "level_gap_analysis": "Gap between current and target level",
  "best_fit_roles": ["role types that match their strengths"],
  "best_fit_company_types": ["startup" | "growth stage" | "enterprise" | "FAANG", etc],
  "leveling_strategy": "Specific advice on how to level up",
  "undervaluation_signals": ["signs they may be undervaluing themselves"],
  "overvaluation_signals": ["signs they may be overvaluing themselves"],
  "market_positioning": "How to position themselves in the market",
  "immediate_actions": ["3 things to do this week"],
  "three_month_plan": "What to focus on over next 3 months"
}

Be direct and specific. Don't sugarcoat. Give actionable career advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an experienced tech career strategist who has helped hundreds of PMs level up. Return only valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    let leverageAnalysis = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        leverageAnalysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse leverage analysis:", e);
      }
    }

    return new Response(JSON.stringify({
      session_id: sessionId,
      analysis: leverageAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Career leverage analysis error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
