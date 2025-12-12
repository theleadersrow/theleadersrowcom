import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID required");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get session with responses
    const { data: session, error: sessionError } = await supabase
      .from("assessment_sessions")
      .select("*, email")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // Get all responses with question details
    const { data: responses, error: responsesError } = await supabase
      .from("assessment_responses")
      .select(`
        *,
        question:assessment_questions(*),
        option:question_options(*)
      `)
      .eq("session_id", sessionId);

    if (responsesError) throw responsesError;

    // Calculate dimension scores from options
    const dimensionTotals: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
    const levelHints: string[] = [];

    responses?.forEach((response) => {
      if (response.option && response.option.score_map) {
        const scoreMap = response.option.score_map as Record<string, number>;
        Object.entries(scoreMap).forEach(([dim, score]) => {
          dimensionTotals[dim] = (dimensionTotals[dim] || 0) + score;
          dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
        });

        const levelMap = response.option.level_map as Record<string, string>;
        if (levelMap?.level_hint) {
          levelHints.push(levelMap.level_hint);
        }
      }

      // Handle numeric responses
      if (response.numeric_value && response.question) {
        const weight = response.question.weight || 1;
        const normalizedScore = (response.numeric_value / 5) * 100 * weight;
        dimensionTotals["general"] = (dimensionTotals["general"] || 0) + normalizedScore;
        dimensionCounts["general"] = (dimensionCounts["general"] || 0) + 1;
      }
    });

    // Normalize dimension scores to 0-100
    const dimensionScores: Record<string, number> = {};
    Object.keys(dimensionTotals).forEach((dim) => {
      const avgScore = dimensionTotals[dim] / dimensionCounts[dim];
      // Normalize assuming max score per question is ~10
      dimensionScores[dim] = Math.min(100, Math.max(0, avgScore * 10));
    });

    // Calculate overall score
    const overallScore = Object.values(dimensionScores).length > 0
      ? Object.values(dimensionScores).reduce((a, b) => a + b, 0) / Object.values(dimensionScores).length
      : 50;

    // Infer level based on scores
    let currentLevelInferred = "PM";
    const strategy = dimensionScores.strategy || 50;
    const influence = dimensionScores.influence || 50;
    const ambiguity = dimensionScores.ambiguity || 50;
    const leadership = dimensionScores.leadership || 50;
    const narrative = dimensionScores.narrative || 50;

    if (overallScore > 85 && narrative >= 75 && influence >= 75 && ambiguity >= 75) {
      currentLevelInferred = "Director";
    } else if (overallScore >= 75 && leadership >= 70) {
      currentLevelInferred = "GPM";
    } else if (overallScore >= 60 && strategy >= 65 && influence >= 60) {
      currentLevelInferred = "Principal";
    } else if (overallScore >= 45) {
      currentLevelInferred = "Senior";
    }

    // Override with most common level hint if available
    if (levelHints.length > 0) {
      const hintCounts = levelHints.reduce((acc, hint) => {
        acc[hint] = (acc[hint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const mostCommon = Object.entries(hintCounts).sort((a, b) => b[1] - a[1])[0];
      if (mostCommon && mostCommon[1] >= 2) {
        currentLevelInferred = mostCommon[0];
      }
    }

    // Build skill heatmap FIRST (needed for blocker and actions logic)
    const sortedDimensions = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]);
    const skillHeatmap = {
      strengths: sortedDimensions.slice(0, 3).map(([dim]) => dim),
      gaps: sortedDimensions.slice(-3).map(([dim]) => dim),
    };

    // Determine blocker archetype with description
    let blockerArchetype = "";
    let blockerDescription = "";
    let marketReadinessScore = "";
    const execution = dimensionScores.execution || 50;
    const visibility = dimensionScores.visibility || 50;

    if (execution > 70 && visibility < 50) {
      blockerArchetype = "Invisible Expert";
      blockerDescription = "You consistently deliver exceptional work, yet your contributions remain unseen by decision-makers. You've mastered the craft of product management but haven't learned to amplify your impact through strategic visibility. Your work speaks—but not loudly enough. Until you learn to narrate your wins and position yourself as a leader (not just a doer), promotions and opportunities will go to less capable but more visible peers.";
    } else if (execution > 70 && strategy < 50) {
      blockerArchetype = "Execution Hero";
      blockerDescription = "You're the person everyone counts on to get things done—reliable, thorough, and tireless. But this very strength has become your ceiling. By being so good at execution, you've trained your organization to see you as a doer, not a thinker. The path forward isn't working harder; it's stepping back to lead strategy, delegate execution, and let others do the work you've been hoarding.";
    } else if (strategy > 60 && influence < 50) {
      blockerArchetype = "Strategic Thinker Without Voice";
      blockerDescription = "You see what others miss—the patterns, the opportunities, the right path forward. But your insights die in your head or get lost in meetings where louder voices dominate. Your strategic capability is wasted without the influence skills to make people listen, buy in, and act. Developing executive presence and persuasion isn't optional—it's the unlock that makes your thinking matter.";
    } else if (overallScore > 60 && narrative < 45) {
      blockerArchetype = "Over-Deliverer";
      blockerDescription = "You hold yourself to impossibly high standards, polishing every deliverable until it shines. This perfectionism feels like quality—but it's actually fear dressed up as excellence. You're slow when the market rewards speed, and you're invisible while peers who ship 'good enough' work build track records. The uncomfortable truth: done is better than perfect, and your career is stalling while you polish.";
    } else if (overallScore > 50 && ambiguity < 40) {
      blockerArchetype = "Certainty Seeker";
      blockerDescription = "You thrive when the path is clear, but freeze or over-analyze when facing ambiguity. In senior roles, the map disappears—you become the one who must create clarity for others. Your need for certainty is limiting your scope and keeping you in roles where someone else defines the direction. Building comfort with incomplete information is your gateway to leadership.";
    }

    // Generate market readiness score
    if (overallScore >= 80) {
      marketReadinessScore = "You're ready to compete for senior roles now—your gaps are refinements, not blockers.";
    } else if (overallScore >= 65) {
      marketReadinessScore = "You're close but have 1-2 critical gaps that hiring managers will notice—fix them in the next 60 days.";
    } else if (overallScore >= 50) {
      marketReadinessScore = "You have foundational strengths but need 3-6 months of focused development before targeting your next level.";
    } else {
      marketReadinessScore = "Focus on building core competencies first—rushing to apply will waste opportunities.";
    }

    // Generate 30-day action list
    const thirtyDayActions: string[] = [];
    
    // Based on top gap
    const topGap = skillHeatmap.gaps[0];
    if (topGap === "visibility" || topGap === "narrative") {
      thirtyDayActions.push("Write and share one LinkedIn post about a recent win or lesson learned");
      thirtyDayActions.push("Schedule a 1:1 with your skip-level to share what you're working on");
    } else if (topGap === "influence") {
      thirtyDayActions.push("Identify one stakeholder you need to influence and set up a relationship-building coffee chat");
      thirtyDayActions.push("Practice your 'executive summary' pitch for your current project");
    } else if (topGap === "strategy") {
      thirtyDayActions.push("Block 2 hours to write a one-page strategy doc for your product area");
      thirtyDayActions.push("Study one competitor's product strategy and document what they're betting on");
    } else {
      thirtyDayActions.push("Document your top 3 wins from the past quarter with measurable impact");
    }

    // Based on blocker
    if (blockerArchetype === "Invisible Expert") {
      thirtyDayActions.push("Send a weekly 'wins' update to your manager highlighting your impact");
    } else if (blockerArchetype === "Execution Hero") {
      thirtyDayActions.push("Delegate one task you normally do yourself and coach someone else to own it");
    } else if (blockerArchetype === "Strategic Thinker Without Voice") {
      thirtyDayActions.push("Speak up in the first 5 minutes of your next cross-functional meeting with a prepared POV");
    }

    // Always add networking
    thirtyDayActions.push("Reach out to 2 PMs at your target level/company for informational conversations");

    // Limit to 5
    const limitedActions = thirtyDayActions.slice(0, 5);

    // Generate experience gaps based on level gap
    const experienceGaps = [];
    if (currentLevelInferred === "PM" || currentLevelInferred === "Senior") {
      experienceGaps.push("Lead a 0→1 product launch");
      experienceGaps.push("Present to executive stakeholders");
      experienceGaps.push("Own cross-functional initiative");
    }
    if (currentLevelInferred === "Senior") {
      experienceGaps.push("Mentor junior PMs");
      experienceGaps.push("Define product strategy for a product area");
    }
    if (currentLevelInferred === "Principal") {
      experienceGaps.push("Influence company-level strategy");
      experienceGaps.push("Build and scale a PM team");
    }

    // Market fit suggestions
    const marketFit = {
      role_types: currentLevelInferred === "Director" 
        ? ["VP Product", "Director of Product", "Head of Product"] 
        : currentLevelInferred === "GPM"
        ? ["Group PM", "Senior PM Manager", "Head of Product (startup)"]
        : currentLevelInferred === "Principal"
        ? ["Principal PM", "Staff PM", "Lead PM"]
        : ["Senior PM", "PM II", "Product Lead"],
      company_types: strategy > 60 
        ? ["Growth-stage startups", "Big Tech", "Category leaders"]
        : ["Established companies", "Mid-size tech", "B2B SaaS"],
    };

    // Save scores
    const { error: scoreError } = await supabase
      .from("assessment_scores")
      .upsert({
        session_id: sessionId,
        overall_score: overallScore,
        current_level_inferred: currentLevelInferred,
        level_gap: 0, // Would need target level from user profile
        dimension_scores: dimensionScores,
        skill_heatmap: skillHeatmap,
        experience_gaps: experienceGaps,
        blocker_archetype: blockerArchetype,
        market_fit: marketFit,
      }, { onConflict: "session_id" });

    if (scoreError) {
      console.error("Error saving scores:", scoreError);
    }

    // Generate AI report
    const systemPrompt = `You are an elite executive career strategist and product leadership coach. You produce direct, high-signal, no-fluff guidance. You must be specific, practical, and decisive. Avoid generic advice. Use the provided scores and evidence. Do not invent experiences the user did not claim. Write in a confident coaching tone.`;

    const userPrompt = `Generate a "Career Intelligence Report" for a Product Manager with the following assessment data:

**Current Level Inferred:** ${currentLevelInferred}
**Overall Score:** ${overallScore.toFixed(0)}/100
**Dimension Scores:** ${JSON.stringify(dimensionScores)}
**Blocker Archetype:** ${blockerArchetype || "None detected"}
**Top Strengths:** ${skillHeatmap.strengths.join(", ")}
**Key Gaps:** ${skillHeatmap.gaps.join(", ")}

Generate the report with these sections:
1. **Executive Snapshot** - Current level, key constraints, biggest opportunity
2. **Level Calibration** - What signals indicate their level, what's missing for next level
3. **Skill Leverage Map** - Top 3 strengths to double down on, top 3 high-ROI gaps to close
4. **Experience & Exposure Gaps** - Missing reps and how to get them
5. **Blocker Diagnosis** - Describe the pattern and rewiring actions (if applicable)
6. **Market & Role Fit** - Role types and company types that match their profile
7. **Hard Truth** - One paragraph of direct, uncomfortable truth they need to hear
8. **Immediate Next Action** - One specific action to take this week

Keep the tone direct, specific, and actionable. No fluff. No generic advice. Write as if you're a senior executive coach who charges $500/hour.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!aiResponse.ok) {
      console.error("AI response error:", await aiResponse.text());
      throw new Error("Failed to generate AI report");
    }

    const aiData = await aiResponse.json();
    const reportMarkdown = aiData.choices?.[0]?.message?.content || "";

    // Generate growth plan
    const planPrompt = `Based on this Career Intelligence Report, create a 12-week growth plan as a JSON array.

Current Level: ${currentLevelInferred}
Key Gaps: ${skillHeatmap.gaps.join(", ")}
Blocker: ${blockerArchetype || "None"}

Return ONLY a valid JSON array (no markdown, no explanation) with this structure:
[
  {
    "week": 1,
    "focus": "Week theme in 3-5 words",
    "exercises": ["Exercise 1", "Exercise 2"],
    "visibility_actions": ["Action 1"],
    "deliverables": ["Deliverable 1"]
  }
]

Create entries for weeks 1, 2, 3, 4, 6, 8, 10, 12. Focus on practical, specific actions.`;

    const planResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a career planning assistant. Return only valid JSON arrays, no markdown formatting." },
          { role: "user", content: planPrompt },
        ],
      }),
    });

    let growthPlan = [];
    if (planResponse.ok) {
      const planData = await planResponse.json();
      const planText = planData.choices?.[0]?.message?.content || "[]";
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = planText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          growthPlan = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Error parsing growth plan:", e);
        growthPlan = [];
      }
    }

    // Save report
    const { error: reportError } = await supabase
      .from("assessment_reports")
      .upsert({
        session_id: sessionId,
        report_markdown: reportMarkdown,
        growth_plan_json: growthPlan,
      }, { onConflict: "session_id" });

    if (reportError) {
      console.error("Error saving report:", reportError);
    }

    // Update session status
    await supabase
      .from("assessment_sessions")
      .update({ status: "scored", scored_at: new Date().toISOString() })
      .eq("id", sessionId);

    // Send email report if email exists
    if (session.email) {
      try {
        const emailPayload = {
          email: session.email,
          currentLevel: currentLevelInferred,
          overallScore: overallScore,
          blockerArchetype: blockerArchetype || undefined,
          blockerDescription: blockerDescription || undefined,
          marketReadinessScore: marketReadinessScore || undefined,
          thirtyDayActions: limitedActions,
          topStrength: skillHeatmap.strengths[0],
          topGap: skillHeatmap.gaps[0],
        };

        const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-career-report-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send career report email:", await emailResponse.text());
        } else {
          console.log("Career report email sent successfully to:", session.email);
        }
      } catch (emailError) {
        console.error("Error sending career report email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        score: {
          overall_score: overallScore,
          current_level_inferred: currentLevelInferred,
          level_gap: 0,
          dimension_scores: dimensionScores,
          skill_heatmap: skillHeatmap,
          experience_gaps: experienceGaps,
          blocker_archetype: blockerArchetype,
          blocker_description: blockerDescription,
          market_readiness_score: marketReadinessScore,
          thirty_day_actions: limitedActions,
          market_fit: marketFit,
        },
        report: {
          report_markdown: reportMarkdown,
          growth_plan_json: growthPlan,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
