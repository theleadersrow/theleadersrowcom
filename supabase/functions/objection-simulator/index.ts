import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OBJECTION_TYPES = [
  { type: "cost_challenge", template: "Why didn't you consider the cheaper option?" },
  { type: "ownership_probe", template: "That sounds like engineering's job—what did YOU specifically own?" },
  { type: "trust_challenge", template: "Why should I trust this decision was correct?" },
  { type: "alternative_push", template: "What about [alternative approach]? Seems better." },
  { type: "metric_challenge", template: "Those numbers seem made up. How did you measure that?" },
  { type: "scope_question", template: "That's a small project. Show me something with real scope." },
  { type: "failure_probe", template: "What went wrong? You're only telling me the good parts." },
  { type: "stakeholder_conflict", template: "What did you do when leadership disagreed?" },
  { type: "speed_challenge", template: "That took too long. Why didn't you move faster?" },
  { type: "tradeoff_deep_dive", template: "You made tradeoffs. Defend why that was the right call." }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answer, question, targetLevel, intensity = 'moderate' } = await req.json();
    
    console.log(`Generating objection for ${targetLevel} level, intensity: ${intensity}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const intensityOptions: Record<string, string> = {
      light: "Be skeptical but fair. One pointed question.",
      moderate: "Push back firmly. Challenge 2-3 aspects. Make them defend their decisions.",
      aggressive: "Be a tough bar raiser. Interrupt, challenge assumptions, demand evidence. Make them uncomfortable but professional."
    };
    const intensityGuide = intensityOptions[intensity] || intensityOptions.moderate;

    const objectionPrompt = `You are a skeptical senior interviewer at a top tech company conducting a ${targetLevel} PM interview.

The candidate just answered this question:
"${question}"

Their answer:
"${answer}"

Your role: ${intensityGuide}

Generate 1-3 pointed objections/follow-ups that:
1. Challenge weak points in their answer
2. Probe for deeper evidence
3. Test executive presence and composure
4. Push on ownership and decision quality

Return as JSON:
{
  "objections": [
    {
      "type": "cost_challenge" | "ownership_probe" | "trust_challenge" | "metric_challenge" | "scope_question" | "failure_probe" | "tradeoff_deep_dive",
      "objection": "The exact words you'd say as interviewer",
      "what_youre_testing": "What competency this probes",
      "good_response_elements": ["What a strong answer would include"],
      "red_flag_responses": ["What would concern you"]
    }
  ],
  "interviewer_mindset": "What you're really trying to understand",
  "difficulty_level": 1-5
}

Be realistic. Sound like an actual skeptical interviewer, not a cartoon villain.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a tough but fair senior PM interviewer at a FAANG company. Return only valid JSON." },
          { role: "user", content: objectionPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    let objections = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        objections = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse objections:", e);
      }
    }

    return new Response(JSON.stringify(objections || { objections: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Objection simulator error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
