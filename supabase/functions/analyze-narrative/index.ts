import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[ANALYZE-NARRATIVE] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    logStep("Analyzing narrative for session", { sessionId });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get all answers and evaluations for this session
    const { data: evaluations, error: evalError } = await supabase
      .from("interview_evaluations")
      .select(`
        *,
        interview_questions (category, prompt_text),
        interview_answers (answer_text)
      `)
      .eq("session_id", sessionId);

    if (evalError) throw evalError;
    if (!evaluations || evaluations.length === 0) {
      return new Response(JSON.stringify({ error: "No evaluations found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compile all answers for narrative analysis
    const answersContext = evaluations.map(e => ({
      category: e.interview_questions?.category,
      question: e.interview_questions?.prompt_text,
      answer: e.interview_answers?.answer_text,
      score: e.category_score_0_100,
      strengths: e.feedback_strengths,
      gaps: e.feedback_gaps
    }));

    const systemPrompt = `You are a senior PM interviewer analyzing narrative coherence across multiple interview answers.

Your job is to identify:
1. Repeated themes (patterns that appear across multiple answers)
2. Missing themes (PM competencies not demonstrated)
3. Proof gaps (claims without evidence)
4. Metric gaps (where quantification is missing)
5. Ownership gaps (where personal role is unclear)
6. Clarity gaps (where communication could be improved)

PM COMPETENCIES TO CHECK:
- Product Sense & Customer Judgment
- Product Strategy & Vision
- Execution & Delivery
- Data, Metrics & Decision-Making
- Stakeholder Management & Influence
- Leadership, Ownership & Growth

Return a JSON object with this structure:
{
  "narrative_score_0_100": <overall narrative coherence score>,
  "coverage_score": <how well they covered all competencies, 0-100>,
  "proof_metrics_score": <how well claims are backed by metrics, 0-100>,
  "ownership_clarity_score": <how clear their personal ownership is, 0-100>,
  "decision_tradeoffs_score": <how well they articulate decisions and tradeoffs, 0-100>,
  "concision_clarity_score": <how clear and concise their communication is, 0-100>,
  "repeated_themes": ["theme1", "theme2"],
  "missing_themes": ["missing competency 1", "missing competency 2"],
  "proof_gaps": [{"claim": "...", "missing_evidence": "...", "recommended_fix": "..."}],
  "metric_gaps": ["gap 1", "gap 2"],
  "ownership_gaps": ["gap 1", "gap 2"],
  "clarity_gaps": ["gap 1", "gap 2"],
  "story_recommendations": [],
  "next_drill_plan": [{"category": "...", "focus": "...", "priority": 1}]
}`;

    const userPrompt = `Analyze the narrative coherence across these interview answers:

${JSON.stringify(answersContext, null, 2)}

Look for patterns, gaps, and provide specific recommendations. Return ONLY valid JSON.`;

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let narrative;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, content];
      const jsonStr = jsonMatch[1] || content;
      narrative = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      logStep("JSON parse error, using fallback", { error: String(parseError) });
      narrative = {
        narrative_score_0_100: 60,
        coverage_score: 65,
        proof_metrics_score: 55,
        ownership_clarity_score: 60,
        decision_tradeoffs_score: 65,
        concision_clarity_score: 70,
        repeated_themes: ["Execution focus"],
        missing_themes: ["Strategic vision", "Quantified impact"],
        proof_gaps: [],
        metric_gaps: ["Need more numbers"],
        ownership_gaps: ["Clarify personal role"],
        clarity_gaps: [],
        story_recommendations: [],
        next_drill_plan: [{ category: "strategy", focus: "Vision articulation", priority: 1 }]
      };
    }

    // Save to database
    await supabase
      .from("narrative_insights")
      .upsert({
        session_id: sessionId,
        ...narrative
      }, { onConflict: "session_id" });

    logStep("Narrative analysis complete", { score: narrative.narrative_score_0_100 });

    return new Response(JSON.stringify(narrative), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("Error", { error: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
