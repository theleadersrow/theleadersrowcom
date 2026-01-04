import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[GENERATE-STAR-VARIANTS] ${step}`, details ? JSON.stringify(details) : "");
};

interface STARStory {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  competency_tags: string[];
  level_signal: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyId, story }: { storyId: string; story: STARStory } = await req.json();
    logStep("Generating variants for story", { storyId, title: story.title });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert PM interview coach. Transform STAR stories into interview-ready versions.

Create THREE versions of the story:
1. 30-second punchy version: Lead with the result, very concise, highlight key impact
2. 2-minute standard version: Balanced STAR with clear structure and metrics
3. Deep dive version: Full context with tradeoffs, stakeholder dynamics, and lessons learned

Also identify:
- Best PM interview categories for this story (from: product_sense, strategy, execution, data_metrics, influence, leadership)
- Potential follow-up questions an interviewer might ask
- Risk areas: what might sound weak and how to address it

Return a JSON object:
{
  "version_30sec": "<punchy 30-second version>",
  "version_2min": "<balanced 2-minute version>",
  "version_deep_dive": "<comprehensive deep dive version>",
  "best_categories": ["category1", "category2"],
  "followup_questions": ["question1", "question2"],
  "risk_areas": ["risk1 and how to fix it"]
}`;

    const userPrompt = `Transform this STAR story into interview-ready versions:

Title: ${story.title}
Level: ${story.level_signal}

Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}

Competency Tags: ${story.competency_tags.join(", ")}

Return ONLY valid JSON.`;

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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let variants;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, content];
      const jsonStr = jsonMatch[1] || content;
      variants = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      logStep("JSON parse error, using fallback", { error: String(parseError) });
      variants = {
        version_30sec: `I led ${story.title} resulting in ${story.result}`,
        version_2min: `Situation: ${story.situation}\n\nTask: ${story.task}\n\nAction: ${story.action}\n\nResult: ${story.result}`,
        version_deep_dive: `${story.situation}\n\n${story.task}\n\n${story.action}\n\n${story.result}`,
        best_categories: story.competency_tags,
        followup_questions: ["Can you tell me more about the metrics?", "How did you handle disagreements?"],
        risk_areas: ["Consider adding more specific metrics"]
      };
    }

    logStep("Variants generated successfully");

    return new Response(JSON.stringify(variants), {
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
