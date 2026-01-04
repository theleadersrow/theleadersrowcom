import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INTERVIEWER_PERSONAS = [
  {
    name: "Product Sense Interviewer",
    role: "Senior PM",
    focus: "Product intuition, user empathy, market understanding, prioritization frameworks",
    style: "Focuses on 'why' behind product decisions, customer obsession, and vision clarity"
  },
  {
    name: "Execution Interviewer", 
    role: "Engineering Manager",
    focus: "Delivery track record, technical understanding, cross-functional collaboration, risk management",
    style: "Probes into how things actually got done, timelines, blockers, and shipping"
  },
  {
    name: "Bar Raiser",
    role: "Staff PM / Director",
    focus: "Leadership potential, culture fit, raises the bar for the team, long-term thinking",
    style: "Devil's advocate, challenges assumptions, looks for growth mindset and ownership"
  },
  {
    name: "Hiring Manager",
    role: "Director of Product",
    focus: "Team fit, immediate needs, can this person do the job day one, growth trajectory",
    style: "Practical assessment of readiness, team dynamics, and role alignment"
  },
  {
    name: "Cross-Functional Partner",
    role: "Design/Eng Lead",
    focus: "Collaboration style, influence without authority, respect for other functions",
    style: "Evaluates partnership quality, communication, and ability to build trust"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, answers, evaluations, targetLevel, targetCompany } = await req.json();
    
    console.log(`Starting hiring committee simulation for session: ${sessionId}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build context from answers and evaluations
    const answerContext = answers.map((a: any, i: number) => {
      const eval_ = evaluations.find((e: any) => e.answer_id === a.id);
      return `
Question ${i + 1}: ${a.question?.prompt_text || 'Unknown question'}
Category: ${a.question?.category || 'Unknown'}
Answer: ${a.answer_text}
Scores: Problem Framing: ${eval_?.problem_framing_1_5 || 'N/A'}/5, Strategic: ${eval_?.strategic_thinking_1_5 || 'N/A'}/5, Execution: ${eval_?.execution_rigor_1_5 || 'N/A'}/5, Communication: ${eval_?.communication_clarity_1_5 || 'N/A'}/5
Level Calibration: ${eval_?.level_calibration || 'N/A'}
Strengths: ${eval_?.feedback_strengths?.join(', ') || 'N/A'}
Gaps: ${eval_?.feedback_gaps?.join(', ') || 'N/A'}
`;
    }).join('\n---\n');

    const committeeReviews = [];
    
    // Get each interviewer's perspective
    for (const persona of INTERVIEWER_PERSONAS) {
      const personaPrompt = `You are a ${persona.role} interviewing a PM candidate for a ${targetLevel} role${targetCompany ? ` at ${targetCompany}` : ''}.

Your persona: ${persona.name}
Your focus areas: ${persona.focus}
Your evaluation style: ${persona.style}

Based on the following interview performance, provide your independent hiring recommendation.

INTERVIEW PERFORMANCE:
${answerContext}

Provide your assessment as JSON with these fields:
{
  "verdict": "strong_hire" | "hire" | "lean_hire" | "lean_no_hire" | "no_hire",
  "top_positives": ["strength 1", "strength 2"],
  "top_concerns": ["concern 1", "concern 2"],
  "detailed_feedback": "2-3 sentences as you would write in the hiring packet",
  "confidence_score": 0.0-1.0
}

Be direct and specific. Reference actual answers. Think like a real interviewer writing feedback for the hiring committee.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an experienced tech interviewer providing honest hiring feedback. Return only valid JSON." },
            { role: "user", content: personaPrompt }
          ],
        }),
      });

      if (!response.ok) {
        console.error(`Persona ${persona.name} API error:`, response.status);
        continue;
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const review = JSON.parse(jsonMatch[0]);
          committeeReviews.push({
            persona_name: persona.name,
            persona_role: persona.role,
            ...review
          });
        } catch (e) {
          console.error(`Failed to parse response for ${persona.name}:`, e);
        }
      }
    }

    // Generate committee summary
    const summaryPrompt = `You are the Head of Hiring synthesizing feedback from ${committeeReviews.length} interviewers.

INTERVIEWER FEEDBACK:
${committeeReviews.map(r => `
${r.persona_name} (${r.persona_role}): ${r.verdict}
Positives: ${r.top_positives?.join(', ')}
Concerns: ${r.top_concerns?.join(', ')}
`).join('\n')}

Generate the final hiring committee decision as JSON:
{
  "final_verdict": "Strong Hire" | "Hire" | "Lean Hire" | "Lean No Hire" | "No Hire",
  "verdict_explanation": "2-3 sentence summary of why",
  "tipping_factors": ["what pushed the decision one way"],
  "what_would_change": ["what would flip the decision"],
  "consensus_level": "unanimous" | "strong_majority" | "split" | "contentious"
}`;

    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a Head of Hiring making final decisions. Return only valid JSON." },
          { role: "user", content: summaryPrompt }
        ],
      }),
    });

    let committeeSummary = null;
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      const summaryContent = summaryData.choices?.[0]?.message?.content || "";
      const summaryMatch = summaryContent.match(/\{[\s\S]*\}/);
      if (summaryMatch) {
        try {
          committeeSummary = JSON.parse(summaryMatch[0]);
        } catch (e) {
          console.error("Failed to parse summary:", e);
        }
      }
    }

    console.log(`Committee simulation complete: ${committeeReviews.length} reviews generated`);

    return new Response(JSON.stringify({
      reviews: committeeReviews,
      summary: committeeSummary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Hiring committee simulation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
