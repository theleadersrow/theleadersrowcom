import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, answers, evaluations, targetLevel } = await req.json();
    
    console.log(`Checking signal coverage for ${targetLevel} level`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get required signals for target level
    const { data: requiredSignals, error: signalsError } = await supabase
      .from('required_signals')
      .select('*')
      .or(`target_level.eq.${targetLevel},target_level.eq.PM`);

    if (signalsError) {
      console.error("Error fetching signals:", signalsError);
      throw signalsError;
    }

    // Combine all answers for analysis
    const allAnswerText = answers.map((a: any) => 
      `Category: ${a.question?.category}\nQ: ${a.question?.prompt_text}\nA: ${a.answer_text}`
    ).join('\n\n---\n\n');

    const signalsList = (requiredSignals || []).map((s: any) => 
      `- ${s.signal_name}: ${s.signal_description} (${s.importance})`
    ).join('\n');

    const coveragePrompt = `Analyze these PM interview answers for signal coverage at the ${targetLevel} level.

REQUIRED SIGNALS:
${signalsList}

CANDIDATE ANSWERS:
${allAnswerText}

For each required signal, determine if the candidate demonstrated it. Return JSON:
{
  "coverage": [
    {
      "signal_name": "signal name from list",
      "is_covered": true | false,
      "coverage_strength": "strong" | "moderate" | "weak" | "missing",
      "evidence": "Quote or reference from their answer",
      "notes": "Why this counts or doesn't count"
    }
  ],
  "coverage_score": 0-100,
  "critical_gaps": ["signals marked critical that are missing"],
  "suggested_questions": [
    {
      "signal_name": "uncovered signal",
      "question": "Question to ask to elicit this signal",
      "why": "Why this question would help"
    }
  ],
  "story_gaps": ["Types of stories they need to prepare"]
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
          { role: "system", content: "You are an interview coach analyzing signal coverage. Return only valid JSON." },
          { role: "user", content: coveragePrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    let coverageAnalysis = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        coverageAnalysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse coverage analysis:", e);
      }
    }

    // Save coverage to database
    if (coverageAnalysis?.coverage) {
      for (const item of coverageAnalysis.coverage) {
        const signal = requiredSignals?.find((s: any) => s.signal_name === item.signal_name);
        if (signal) {
          await supabase.from('signal_coverage').upsert({
            session_id: sessionId,
            signal_id: signal.id,
            is_covered: item.is_covered,
            coverage_strength: item.coverage_strength,
            notes: item.notes
          }, { onConflict: 'session_id,signal_id' });
        }
      }
    }

    return new Response(JSON.stringify({
      required_signals: requiredSignals,
      analysis: coverageAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Signal coverage check error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
