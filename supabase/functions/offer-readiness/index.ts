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
      committeeReviews,
      targetLevel,
      targetCompany,
      signalCoverage,
      confidenceAnalysis
    } = await req.json();
    
    console.log(`Generating offer readiness analysis for session: ${sessionId}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const categoryBreakdown = categoryScores?.map((c: any) => 
      `${c.category}: ${c.score_0_100}/100`
    ).join(', ') || 'N/A';

    const committeeVerdicts = committeeReviews?.map((r: any) => 
      `${r.persona_name}: ${r.verdict}`
    ).join(', ') || 'N/A';

    const readinessPrompt = `You are a senior recruiter and career coach analyzing a PM candidate's interview readiness and offer potential.

INTERVIEW PERFORMANCE:
- Target Level: ${targetLevel}
- Target Company: ${targetCompany || 'Not specified'}
- Overall Score: ${overallScore}/100
- Narrative Score: ${narrativeScore}/100
- Category Breakdown: ${categoryBreakdown}

COMMITTEE FEEDBACK:
${committeeVerdicts}

${signalCoverage ? `SIGNAL COVERAGE: ${signalCoverage.coverage_score}/100` : ''}
${confidenceAnalysis ? `CONFIDENCE: ${confidenceAnalysis.calibration}` : ''}

Analyze offer readiness as JSON:
{
  "predicted_level": "PM" | "Senior PM" | "Staff PM" | "Principal PM" | "GPM" | "Director",
  "level_match": {
    "matches_target": true | false,
    "likely_outcome": "at_level" | "downleveled" | "upleveled",
    "downlevel_probability": 0.0-1.0,
    "explanation": "Why this level outcome"
  },
  "negotiation_readiness": "strong" | "moderate" | "weak",
  "compensation_leverage": {
    "signals": ["strengths that support higher comp"],
    "risks": ["weaknesses that could limit comp"],
    "positioning": "How to position for best comp"
  },
  "leveling_risks": ["specific risks to getting target level"],
  "leveling_mitigation": ["how to mitigate each risk"],
  "negotiation_recommendations": [
    "Specific negotiation tactics based on their performance"
  ],
  "offer_timeline_advice": "When to push vs wait",
  "company_specific_advice": "Advice specific to ${targetCompany || 'target company type'}",
  "readiness_score": 0-100,
  "ready_for_offer": true | false,
  "next_steps": ["Immediate actions to improve offer readiness"]
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
          { role: "system", content: "You are a senior tech recruiter and career strategist who has negotiated hundreds of PM offers. Return only valid JSON." },
          { role: "user", content: readinessPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    let readinessAnalysis = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        readinessAnalysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse readiness analysis:", e);
      }
    }

    return new Response(JSON.stringify({
      session_id: sessionId,
      analysis: readinessAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Offer readiness error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
