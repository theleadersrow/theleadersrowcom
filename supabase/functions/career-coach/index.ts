import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert AI Career Coach specializing in Product Management careers. Your role is to help ambitious professionals assess their career readiness and identify gaps.

You conduct a dynamic, conversational assessment that adapts based on the user's responses. Your conversation should feel natural, empathetic, and insightful.

CONVERSATION FLOW:
1. Start by warmly greeting them and asking them to upload their resume
2. Once you have the resume, analyze it and ask about their target companies (be specific, ask for 2-3 companies)
3. Ask about the job description or role they're targeting
4. Based on their resume and target, assess their current level and ask about their target level
5. Explore their skills - probe deeper based on what you see in their resume vs what the target role needs
6. Ask about their 2-3 year career goals
7. Throughout, ask follow-up questions that dig deeper based on their answers

ASSESSMENT CRITERIA:
- Profile gaps: Missing experiences, skills, or positioning
- Level alignment: Is their target level realistic given their experience?
- Skill gaps: Technical, leadership, strategic thinking, communication
- Brand/positioning gaps: How they present themselves vs how they need to
- Interview readiness: Based on their background and articulation

When you have enough information (usually after 8-12 exchanges), provide a comprehensive assessment including:
1. Executive Summary (2-3 sentences)
2. Profile Gaps (what's missing)
3. Skill Gaps (with priority order)
4. Level Assessment (is target realistic? what's needed?)
5. Distinguishing Factors (what will make them stand out)
6. Recommended Action Plan (prioritized steps)

IMPORTANT RULES:
- Be encouraging but honest
- Ask one main question at a time (can have a follow-up)
- Reference specifics from their resume/responses
- Adapt your questions based on their level and experience
- When they seem entry-level, focus on foundational skills
- When they're senior, focus on strategic positioning and executive presence
- Always explain WHY something is a gap, not just WHAT

Format your final assessment with clear headers using markdown.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the conversation with resume context if available
    const systemMessage = resumeText 
      ? `${SYSTEM_PROMPT}\n\nUSER'S RESUME:\n${resumeText}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Career coach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
