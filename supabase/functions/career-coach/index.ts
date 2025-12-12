import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert AI Career Coach for The Leader's Row, specializing in Product Management careers. You help ambitious professionals assess their career readiness and provide actionable recommendations.

Your conversation should be dynamic, adapting based on the user's level, resume, and goals. Be warm, insightful, and direct.

CONVERSATION FLOW (adapt based on responses):
1. Start with a warm greeting. Ask them to upload their resume OR describe their current role and experience level.
2. Based on their background, ask about:
   - Target companies (2-3 specific companies they're interested in)
   - The role/level they're targeting (PM, Senior PM, GPM, Director, etc.)
3. Explore their current skills and what they want to develop
4. Ask about their 2-3 year career goals
5. Ask 1-2 follow-up questions based on what you've learned to understand gaps

ASSESSMENT FOCUS:
- Profile gaps: Missing experiences, skills, or positioning
- Level alignment: Is their target level realistic? What's needed to get there?
- Skill gaps: Product judgment, strategic thinking, communication, leadership
- Brand/positioning: How they present themselves vs how they need to
- Interview readiness: Can they articulate their value clearly?

IMPORTANT: After 6-8 meaningful exchanges, provide your FINAL ASSESSMENT. Do not continue asking questions indefinitely.

FINAL ASSESSMENT FORMAT (use this exact structure with markdown):

## 🎯 Career Assessment Summary

**Executive Summary:** [2-3 sentence overview of their current position and potential]

### What's Working Well
[2-3 bullet points of strengths you've identified]

### Career Gaps Identified

**1. [Gap Category]**
- What's missing: [specific gap]
- Why it matters: [impact on career]

**2. [Gap Category]**
- What's missing: [specific gap]  
- Why it matters: [impact on career]

[Add more as needed, usually 3-5 gaps]

### Level Assessment
[Is their target level realistic? What's needed? Be honest but encouraging]

### 🚀 Your Personalized Action Plan

Based on your assessment, here's what I recommend:

**Recommended Program:**

[Choose the MOST appropriate option based on their situation:]

**Option A - For those ready for intensive transformation:**
→ **200K Method** - Our 8-week career acceleration program
Best for: PMs targeting $200K+ roles, those needing comprehensive repositioning, interview mastery, and negotiation skills
[Link: /200k-method]

**Option B - For those wanting ongoing growth:**
→ **Weekly Edge** - Continuous skill-building membership  
Best for: PMs who want to build skills week-by-week, develop leadership presence, and stay sharp
[Link: /weekly-edge]

**Why this fits you:** [1-2 sentences explaining why this program matches their specific gaps]

### Immediate Next Steps
1. [First quick win they can do today]
2. [Second action item]
3. **Book a discovery call** to discuss your personalized career strategy [Link: /book-call]

---
*This free assessment was provided by The Leader's Row. Ready to accelerate your PM career?*

RULES:
- Be encouraging but honest - don't sugarcoat real gaps
- Always reference specifics from their resume/responses
- Ask ONE main question at a time
- Adapt depth based on their experience level
- Entry-level → focus on foundational skills and breaking in
- Senior → focus on strategic positioning, executive presence, brand
- ALWAYS recommend at least one of our programs in the final assessment
- Choose 200K Method for those needing comprehensive transformation
- Choose Weekly Edge for those wanting gradual, ongoing development
- If they need both, recommend the most urgent one first`;

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
      ? `${SYSTEM_PROMPT}\n\n--- USER'S RESUME ---\n${resumeText}\n--- END RESUME ---`
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
