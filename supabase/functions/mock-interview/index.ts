import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[MOCK-INTERVIEW] ${step}`, details ? JSON.stringify(details) : "");
};

interface InterviewContext {
  roleType: "product" | "software";
  level: string;
  company: string;
  location: string;
  interviewType?: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

function getSystemPrompt(context: InterviewContext): string {
  const { roleType, level, company, location, interviewType } = context;
  
  const roleSpecificContext = roleType === "product" 
    ? `You are conducting a Product Management interview. Focus on:
- Product sense and problem framing
- Product strategy and vision
- Execution and decision-making
- Metrics and data-driven thinking
- Stakeholder management
- Leadership and growth mindset

Use realistic PM interview questions from top companies like Google, Meta, Amazon, Microsoft, Stripe, and Airbnb.
Include product design questions, metrics questions, strategy questions, and behavioral questions.
For product design: Ask about improving specific products, designing new features, or solving user problems.
For metrics: Ask about defining success metrics, debugging metric drops, and choosing North Star metrics.
For strategy: Ask about market entry, competitive positioning, and long-term vision.`
    : `You are conducting a Software Engineering interview. Focus on:
- System design and architecture
- Coding and algorithms
- Technical problem-solving
- Code review and best practices
- Collaboration and communication
- Technical leadership (for senior roles)

Use realistic SWE interview questions from top companies like Google, Meta, Amazon, Microsoft, Netflix, and Apple.
Include system design questions, behavioral questions, and technical scenario questions.
For system design: Ask about designing scalable systems, handling high traffic, and making architectural decisions.
For coding discussions: Ask about approach to problem-solving, optimization, and trade-offs.
For behavioral: Ask about past projects, debugging challenges, and team collaboration.`;

  return `You are an expert interviewer conducting a realistic ${level} ${roleType === "product" ? "Product Manager" : "Software Engineer"} interview for ${company || "a top tech company"}${location ? ` (${location} office)` : ""}.

${roleSpecificContext}

## Your Role:
1. **Act as a real interviewer** - Be professional, engaging, and realistic
2. **Ask one question at a time** - Wait for the candidate's response before moving on
3. **Provide constructive feedback** - After each answer, give specific, actionable feedback
4. **Guide improvement** - Suggest how they could strengthen their response
5. **Adapt difficulty** - Adjust based on their ${level} level

## Interview Flow:
${interviewType === "behavioral" ? "Focus on STAR-format behavioral questions about past experiences." : 
  interviewType === "product_sense" ? "Focus on product design and product sense questions." :
  interviewType === "system_design" ? "Focus on system design and architecture questions." :
  interviewType === "metrics" ? "Focus on metrics, analytics, and data-driven decision making." :
  interviewType === "strategy" ? "Focus on product strategy, market analysis, and competitive positioning." :
  interviewType === "technical" ? "Focus on technical problem-solving and coding approach discussions." :
  "Mix different question types for a comprehensive interview experience."}

## Response Format:
When asking a question, be direct and conversational like a real interviewer.
When giving feedback, use this structure:
- **What you did well**: Specific strengths in their answer
- **Areas to improve**: Constructive suggestions
- **Stronger response example**: A brief example of how to elevate the answer
- **Follow-up** (optional): A probing question to go deeper

## Important Guidelines:
- Be encouraging but honest
- Reference ${company || "the company"}'s actual products/services when relevant
- For ${level} level, calibrate expectations appropriately
- Keep feedback concise but actionable
- After 3-4 questions in one area, offer to switch topics or end the session

Start by introducing yourself as the interviewer and asking your first question based on the interview type selected.`;
}

function getProductQuestions(level: string, company: string, interviewType: string): string[] {
  const companyProducts: Record<string, string[]> = {
    "google": ["Google Search", "YouTube", "Google Maps", "Gmail", "Google Cloud"],
    "meta": ["Facebook", "Instagram", "WhatsApp", "Messenger", "Meta Quest"],
    "amazon": ["Amazon Shopping", "Prime Video", "AWS", "Alexa", "Kindle"],
    "microsoft": ["Teams", "Office 365", "Azure", "LinkedIn", "Windows"],
    "apple": ["iPhone", "App Store", "Apple Music", "iCloud", "Apple Pay"],
    "netflix": ["Netflix streaming", "Netflix recommendations", "Netflix profiles"],
    "stripe": ["Stripe Payments", "Stripe Atlas", "Stripe Connect", "Stripe Billing"],
    "airbnb": ["Airbnb search", "Airbnb Experiences", "Host tools", "Trust & Safety"],
  };

  const products = companyProducts[company.toLowerCase()] || ["the main product", "a key feature", "the mobile app"];
  const product = products[Math.floor(Math.random() * products.length)];

  const questions: Record<string, string[]> = {
    product_sense: [
      `How would you improve ${product}?`,
      `Design a new feature for ${product} that would increase user engagement.`,
      `You're the PM for ${product}. A key metric dropped 10% this week. Walk me through how you'd investigate.`,
      `How would you prioritize features for ${product}'s next quarter roadmap?`,
      `Design a product to help small businesses manage their finances.`,
    ],
    metrics: [
      `What metrics would you use to measure the success of ${product}?`,
      `How would you choose a North Star metric for a new product launch?`,
      `${product}'s daily active users are flat but revenue is growing. What's happening?`,
      `How would you design an A/B test to validate a new feature hypothesis?`,
    ],
    strategy: [
      `How would you position ${product} against its main competitors?`,
      `Should ${company || "the company"} expand ${product} internationally? How would you approach this?`,
      `What's the 3-year vision for ${product}? How would you get there?`,
      `A competitor just launched a similar feature. How do you respond?`,
    ],
    behavioral: [
      `Tell me about a product you shipped that you're most proud of. What made it successful?`,
      `Describe a time you had to make a difficult prioritization decision. How did you approach it?`,
      `Tell me about a time you disagreed with an engineer or designer. How did you resolve it?`,
      `Give me an example of when you had to influence without authority.`,
      `Describe a product failure you experienced. What did you learn?`,
    ],
  };

  return questions[interviewType] || questions.product_sense;
}

function getSoftwareQuestions(level: string, company: string, interviewType: string): string[] {
  const questions: Record<string, string[]> = {
    system_design: [
      `Design a URL shortening service like bit.ly. How would you handle billions of URLs?`,
      `Design a real-time chat system like Slack. What are the key architectural decisions?`,
      `Design a news feed system. How would you handle high traffic and personalization?`,
      `Design a rate limiter for an API. What algorithms would you consider?`,
      `Design a distributed cache. How would you handle cache invalidation?`,
    ],
    technical: [
      `Walk me through how you would debug a production issue where the application is slow.`,
      `How would you approach refactoring a legacy codebase that has no tests?`,
      `Explain how you would optimize a slow database query in a production system.`,
      `How do you decide between different data structures for a given problem?`,
      `Walk me through your approach to code reviews. What do you look for?`,
    ],
    behavioral: [
      `Tell me about a complex technical project you led. What were the key challenges?`,
      `Describe a time you had to learn a new technology quickly. How did you approach it?`,
      `Tell me about a time you disagreed with a technical decision. How did you handle it?`,
      `Give me an example of when you had to balance technical debt with feature delivery.`,
      `Describe a production incident you handled. What was your approach?`,
    ],
  };

  return questions[interviewType] || questions.system_design;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, action } = await req.json();
    logStep("Request received", { action, context, messageCount: messages?.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle different actions
    if (action === "get_questions") {
      const questions = context.roleType === "product" 
        ? getProductQuestions(context.level, context.company, context.interviewType)
        : getSoftwareQuestions(context.level, context.company, context.interviewType);
      
      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Main chat flow
    const systemPrompt = getSystemPrompt(context);
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
    ];

    logStep("Calling AI API", { messageCount: apiMessages.length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limits reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      logStep("AI API error", { status: response.status, error: errorText });
      throw new Error(`AI API error: ${response.status}`);
    }

    logStep("Streaming response");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    logStep("Error", { error: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
