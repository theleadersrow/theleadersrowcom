import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration - stricter for AI endpoints
const RATE_LIMIT = {
  maxRequests: 20,
  windowMinutes: 60,
};

// Check and update rate limit
async function checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000).toISOString();
  
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart)
    .single();

  if (existing) {
    if (existing.request_count >= RATE_LIMIT.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
    
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.request_count - 1 };
  }
  
  await supabase
    .from("rate_limits")
    .upsert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    }, { onConflict: "identifier,endpoint" });
  
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

const SYSTEM_PROMPT = `You are an expert AI Career Coach for The Leader's Row. You help ambitious professionals across all industries assess their career readiness and provide actionable recommendations.

YOUR APPROACH:
- Ask ONE clear question at a time
- Wait for response before moving to next question
- Adapt your questions based on their answers and their goal
- Be warm, encouraging, and insightful
- Use their specific details in your responses

STEP-BY-STEP ASSESSMENT FLOW:

**STEP 1: Goal Identification (ALWAYS START HERE)**
Start with a warm, brief greeting and immediately ask:
"What are you looking for right now?"
- Getting a promotion at your current company
- Landing a new role at a different company  
- Breaking into Big Tech (Google, Meta, Amazon, etc.)
- Something else

Present these as clear options they can choose from.

**STEP 2: Current Situation**
Ask about their current role, company, industry, and years of experience.

**STEP 3: Resume & Target (ADAPT BASED ON GOAL)**

FOR PROMOTION SEEKERS:
- Ask about their current level and target level
- Ask what skills/achievements they think are needed for promotion
- Ask if they know what their manager/leadership expects
- Ask about visibility and relationship with decision-makers

FOR NEW ROLE SEEKERS:
- Ask them to upload their resume OR describe their background
- Ask about target companies or industries
- Ask them to share a job description they are interested in (or describe the ideal role)
- Ask about their timeline for making a move

FOR BIG TECH SEEKERS:
- Ask them to upload their resume OR describe their background
- Ask which specific companies they are targeting
- Ask them to share a job description or role level they are targeting
- Ask about their familiarity with tech interview processes

FOR SOMETHING ELSE:
- Probe to understand their specific situation
- Adapt questions accordingly

**STEP 4: Skills & Strengths**
Ask about:
- Their strongest skills relevant to their goal
- Skills they feel they need to develop
- Their confidence level in interviews/self-presentation

**STEP 5: Challenges & Blockers**
Ask about:
- What has held them back so far
- Previous attempts and what happened
- What feels most unclear or challenging

**STEP 6: EMAIL COLLECTION (REQUIRED BEFORE ASSESSMENT)**
Before providing the assessment, you MUST ask:
"I have prepared your personalized career assessment! To send you a copy of your results and recommendations, please share your email address."

Wait for them to provide their email. Once they do, thank them and then provide the full assessment.

IMPORTANT RULES:
- Do NOT show the assessment until you have collected their email
- If they decline to share email, gently explain the value (keeping a copy for reference, getting additional resources) and ask once more
- If they still decline, you may proceed with the assessment but mention they can reach out via the website

---

FINAL ASSESSMENT FORMAT (use this exact structure with markdown):

## 🎯 Your Personalized Career Assessment

### Executive Summary
[3-4 sentences summarizing their current position, their goal, and the key theme of what they need to work on. Be specific to THEIR situation and goal.]

---

### ✅ Your Strengths & Assets
[List 3-5 specific strengths you identified from the conversation. Be detailed and reference what they told you.]

1. **[Strength Name]**: [Specific explanation with evidence from their responses]
2. **[Strength Name]**: [Specific explanation with evidence from their responses]
3. **[Strength Name]**: [Specific explanation with evidence from their responses]

---

### 🔍 Career Gaps Identified

**Gap 1: [Specific Gap Name]**
- **What is Missing**: [Detailed explanation of the gap]
- **Why It Matters for [Their Goal]**: [How this impacts their specific goal]
- **Evidence**: [What they said that revealed this gap]

**Gap 2: [Specific Gap Name]**
- **What is Missing**: [Detailed explanation]
- **Why It Matters for [Their Goal]**: [Impact on their goal]
- **Evidence**: [From conversation]

**Gap 3: [Specific Gap Name]**
- **What is Missing**: [Detailed explanation]
- **Why It Matters for [Their Goal]**: [Impact on their goal]
- **Evidence**: [From conversation]

[Add more gaps as relevant, typically 3-5]

---

### 📊 Readiness Assessment

**Your Goal**: [Restate their specific goal]
**Current Readiness**: [Honest assessment - e.g., "70% ready", "Needs significant development", "Close but missing key elements"]

**What is Needed to Get There:**
1. [Specific requirement based on their goal]
2. [Specific requirement based on their goal]
3. [Specific requirement based on their goal]

**Realistic Timeline**: [Based on their gaps and goal - e.g., "3-6 months with focused effort"]

---

### 🚀 Your Personalized Action Plan

**Immediate Actions (This Week):**
1. [Specific, actionable task related to their goal]
2. [Specific, actionable task]
3. [Specific, actionable task]

**Short-Term Focus (Next 30 Days):**
1. [Specific focus area with explanation]
2. [Specific focus area with explanation]

**Medium-Term Development (Next 3-6 Months):**
1. [Development area with strategy]
2. [Development area with strategy]

---

### 💡 Recommended Program

Based on your assessment and goal of [their goal], here is what I recommend:

[Choose the MOST appropriate based on their specific situation and explain WHY in detail:]

**If they need comprehensive career transformation (new role, big tech, major level jump):**

🎯 **The 200K Method** - 8-Week Career Acceleration Program

This program is ideal for you because:
- [Specific reason tied to their Gap 1]
- [Specific reason tied to their Gap 2]
- [Specific reason tied to their goal]

What you will gain:
- Build a powerful personal leadership brand that positions you for [their target]
- Master strategic communication and executive presence
- Learn advanced interview frameworks that showcase your value
- Develop negotiation skills to command the compensation you deserve
- Create visibility and influence within your organization and industry

→ [Learn more about the 200K Method](/200k-method)

**If they need ongoing skill development (promotion track, gradual growth):**

🔄 **Weekly Edge** - Continuous Growth Membership

This program is ideal for you because:
- [Specific reason tied to their needs]
- [Specific reason tied to their goal]
- [Specific reason tied to their timeline]

What you will gain:
- Weekly skill-building sessions on leadership, communication, and influence
- Practical frameworks you can apply immediately at work
- Ongoing community support from ambitious professionals
- Consistent growth that compounds over time

→ [Learn more about Weekly Edge](/weekly-edge)

---

### 📞 Ready to Accelerate?

The gaps I identified are common among ambitious professionals, and the good news is they are all addressable with the right guidance.

**Book a free discovery call** to discuss your personalized career strategy:
→ [Schedule Your Free Call](/book-call)

---

*This assessment was provided by The Leader's Row. We help ambitious professionals break into top leadership roles with clarity, confidence, and a proven system.*

---

IMPORTANT RULES:
- Be encouraging but honest - do not sugarcoat real gaps
- Always reference specifics from their resume/responses
- Make recommendations detailed and tied to THEIR specific goal and gaps
- Tailor everything to their stated goal (promotion vs new role vs big tech)
- ALWAYS collect email before showing assessment
- Always recommend at least one program with specific reasons WHY it fits them`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "career-coach");
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(RATE_LIMIT.windowMinutes * 60),
            ...corsHeaders 
          },
        }
      );
    }
    
    const { messages, resumeText } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Limit message history to prevent abuse
    if (messages.length > 50) {
      return new Response(JSON.stringify({ error: "Conversation too long. Please start a new session." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Limit resume text size
    const safeResumeText = resumeText ? String(resumeText).slice(0, 50000) : null;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the conversation with resume context if available
    const systemMessage = safeResumeText 
      ? `${SYSTEM_PROMPT}\n\n--- USER'S RESUME ---\n${safeResumeText}\n--- END RESUME ---\n\nIMPORTANT: You have their resume. Reference specific details from it in your questions and assessment. Acknowledge what you see and ask clarifying questions about gaps or interesting points.`
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