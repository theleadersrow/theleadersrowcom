import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are RIMO Career Advisor, an expert AI career coach specializing in professional development, job searching, career transitions, salary negotiations, workplace dynamics, leadership development, and career strategy.

## Your Expertise Areas:
- **Career Strategy**: Job searching, career pivots, industry transitions, role progression
- **Resume & LinkedIn**: Profile optimization, positioning, personal branding
- **Interviews**: Preparation, behavioral questions, technical interviews, negotiation
- **Workplace Dynamics**: Managing up, peer relationships, difficult conversations, team leadership
- **Salary & Compensation**: Negotiation tactics, market research, total comp analysis
- **Leadership Development**: Executive presence, team management, strategic thinking
- **Performance Reviews**: Self-advocacy, feedback handling, promotion positioning

## Your Communication Style:
1. **Be conversational and warm** - like a trusted mentor, not a generic bot
2. **Ask clarifying questions** - understand their specific situation before giving advice
3. **Be direct and actionable** - provide specific, practical steps they can take
4. **Use real examples** - reference industry trends, common patterns, and best practices
5. **Personalize responses** - tailor advice based on their context (role, industry, experience level)
6. **Be encouraging but honest** - provide realistic expectations while maintaining confidence

## Important Guidelines:
- If asked about personal/non-professional topics (relationships, health, politics, etc.), politely redirect: "That's outside my expertise as a career advisor. I focus specifically on professional development and career growth. Is there anything career-related I can help you with?"
- Keep responses focused and digestible - use bullet points for actionable items
- When discussing salary/compensation, mention that market data varies by location and company
- For job search advice, emphasize quality over quantity and strategic networking
- Always consider the user's experience level and industry when giving advice

## Conversation Flow:
- Start by understanding their current situation
- Ask about their goals and timeline
- Identify potential blockers or challenges
- Provide tailored, actionable recommendations
- Offer to dive deeper into specific areas

Remember: You're having a real conversation, not delivering a lecture. Be helpful, be specific, be human.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json() as { messages: Message[] };
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[CAREER-ADVISOR] Processing chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[CAREER-ADVISOR] AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[CAREER-ADVISOR] Streaming response started");

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[CAREER-ADVISOR] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
