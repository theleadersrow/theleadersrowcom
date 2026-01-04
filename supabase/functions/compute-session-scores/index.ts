import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[COMPUTE-SESSION-SCORES] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    logStep("Computing scores for session", { sessionId });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all evaluations for this session
    const { data: evaluations, error: evalError } = await supabase
      .from("interview_evaluations")
      .select(`
        *,
        interview_questions (category)
      `)
      .eq("session_id", sessionId);

    if (evalError) throw evalError;
    if (!evaluations || evaluations.length === 0) {
      logStep("No evaluations found");
      return new Response(JSON.stringify({ success: false, message: "No evaluations found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Found evaluations", { count: evaluations.length });

    // Calculate category scores
    const categoryMap: Record<string, {
      scores: number[];
      dimensions: Record<string, number[]>;
      below: number;
      at: number;
      above: number;
    }> = {};

    evaluations.forEach(e => {
      const category = e.interview_questions?.category || "unknown";
      if (!categoryMap[category]) {
        categoryMap[category] = {
          scores: [],
          dimensions: {
            problem_framing: [],
            strategic_thinking: [],
            execution_rigor: [],
            decision_quality: [],
            communication_clarity: [],
            ownership_impact: []
          },
          below: 0,
          at: 0,
          above: 0
        };
      }

      categoryMap[category].scores.push(e.category_score_0_100 || 0);
      
      if (e.problem_framing_1_5) categoryMap[category].dimensions.problem_framing.push(e.problem_framing_1_5);
      if (e.strategic_thinking_1_5) categoryMap[category].dimensions.strategic_thinking.push(e.strategic_thinking_1_5);
      if (e.execution_rigor_1_5) categoryMap[category].dimensions.execution_rigor.push(e.execution_rigor_1_5);
      if (e.decision_quality_1_5) categoryMap[category].dimensions.decision_quality.push(e.decision_quality_1_5);
      if (e.communication_clarity_1_5) categoryMap[category].dimensions.communication_clarity.push(e.communication_clarity_1_5);
      if (e.ownership_impact_1_5) categoryMap[category].dimensions.ownership_impact.push(e.ownership_impact_1_5);

      if (e.level_calibration === "below") categoryMap[category].below++;
      else if (e.level_calibration === "at") categoryMap[category].at++;
      else if (e.level_calibration === "above") categoryMap[category].above++;
    });

    // Insert/update category scores
    for (const [category, data] of Object.entries(categoryMap)) {
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      
      // Find strongest and weakest dimensions
      const dimAvgs: [string, number][] = Object.entries(data.dimensions)
        .map(([dim, vals]) => [dim, vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0]);
      
      dimAvgs.sort((a, b) => b[1] - a[1]);
      const strongest = dimAvgs[0]?.[0] || "";
      const weakest = dimAvgs[dimAvgs.length - 1]?.[0] || "";

      await supabase
        .from("session_category_scores")
        .upsert({
          session_id: sessionId,
          category,
          score_0_100: avgScore,
          strongest_dimension: strongest,
          weakest_dimension: weakest,
          questions_count: data.scores.length,
          below_count: data.below,
          at_count: data.at,
          above_count: data.above
        }, { onConflict: "session_id,category" });
    }

    // Calculate overall session score
    const allScores = evaluations.map(e => e.category_score_0_100 || 0);
    const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    // Count hire signals
    let strongSignals = 0;
    let redFlags = 0;
    evaluations.forEach(e => {
      const signals = (e.hire_signals as any[]) || [];
      signals.forEach(s => {
        if (s.type === "strong") strongSignals++;
        if (s.type === "red_flag") redFlags++;
      });
    });

    // Determine readiness verdict
    const allBelowCount = evaluations.filter(e => e.level_calibration === "below").length;
    const belowRatio = allBelowCount / evaluations.length;
    let readinessVerdict = "ready";
    if (belowRatio > 0.5 || redFlags > 3) readinessVerdict = "not_yet";
    else if (belowRatio > 0.25 || redFlags > 1) readinessVerdict = "almost_ready";

    // Determine committee recommendation
    let committeeRec = "hire";
    if (overallScore >= 80 && redFlags === 0) committeeRec = "strong_hire";
    else if (overallScore >= 60 && redFlags <= 1) committeeRec = "hire";
    else if (overallScore >= 50) committeeRec = "lean_hire";
    else committeeRec = "no_hire";

    // Update session
    await supabase
      .from("interview_sessions")
      .update({
        overall_score_0_100: overallScore,
        readiness_verdict: readinessVerdict,
        committee_recommendation: committeeRec,
        strong_hire_signals_count: strongSignals,
        red_flags_count: redFlags,
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", sessionId);

    logStep("Session scores computed", { overallScore, readinessVerdict, committeeRec });

    return new Response(JSON.stringify({ 
      success: true, 
      overallScore, 
      readinessVerdict,
      committeeRecommendation: committeeRec 
    }), {
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
