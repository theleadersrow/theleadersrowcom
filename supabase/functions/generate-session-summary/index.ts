import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages to summarize" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format conversation for summary
    const conversationText = messages.map((m: Message) => 
      `${m.role === 'user' ? 'User' : 'Advisor'}: ${m.content}`
    ).join('\n\n');

    const systemPrompt = `You are an AI that analyzes career coaching conversations and generates structured summaries.

Given a conversation between a user and a career advisor, extract:
1. A brief summary (2-3 sentences)
2. Key insights the user gained (3-5 bullet points)
3. Action items for the user to follow up on (3-5 specific, actionable tasks)

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief summary of the conversation...",
  "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "action_items": [
    {"task": "Specific action to take", "priority": "high|medium|low"},
    {"task": "Another action", "priority": "medium"}
  ]
}`;

    console.log("[GENERATE-SUMMARY] Processing conversation with", messages.length, "messages");

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
          { role: "user", content: `Please analyze this career coaching conversation and generate a structured summary:\n\n${conversationText}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENERATE-SUMMARY] AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[GENERATE-SUMMARY] Parse error:", parseError, "Content:", content);
      // Fallback structure
      parsed = {
        summary: "Conversation summary not available.",
        key_insights: ["Review the conversation for insights"],
        action_items: [{ task: "Review your career goals", priority: "medium" }]
      };
    }

    console.log("[GENERATE-SUMMARY] Successfully generated summary");

    return new Response(
      JSON.stringify({
        summary: parsed.summary,
        key_insights: parsed.key_insights || [],
        action_items: parsed.action_items || [],
        sessionId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[GENERATE-SUMMARY] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
