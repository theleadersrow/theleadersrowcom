import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[MOCK-INTERVIEW] ${step}`, details ? JSON.stringify(details) : "");
};

interface WorkExperience {
  currentRole: string;
  yearsExperience: string;
  keyProjects: string;
  biggestAchievement: string;
  technicalSkills: string;
}

interface InterviewContext {
  roleType: "product" | "software";
  level: string;
  company: string;
  location: string;
  interviewType?: string;
  workExperience?: WorkExperience;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Company-specific interview knowledge
const COMPANY_KNOWLEDGE = {
  "Google": {
    culture: "Google values 'Googleyness' - intellectual humility, bias toward action, comfort with ambiguity, and collaborative problem-solving. They use structured interviews with specific rubrics.",
    pmFocus: "Product sense questions focus on 10x thinking, user impact at scale, and data-driven decisions. They value structured frameworks but also creative, user-first solutions.",
    sweFocus: "Strong emphasis on algorithms, system design for Google-scale systems, and code quality. They look for clean, efficient code and ability to handle ambiguity.",
    products: ["Google Search", "YouTube", "Gmail", "Google Maps", "Google Cloud", "Android", "Chrome"],
    values: ["Focus on the user", "10x thinking", "Launch and iterate", "Data-driven decisions"],
  },
  "Meta": {
    culture: "Meta values moving fast, being bold, focusing on impact, and being open. They want people who can ship quickly and iterate based on data.",
    pmFocus: "Strong emphasis on execution and shipping. Product sense questions often involve social features, growth, and designing for billions of users.",
    sweFocus: "Two coding rounds, system design, and behavioral. They value practical problem-solving and building for scale.",
    products: ["Facebook", "Instagram", "WhatsApp", "Messenger", "Meta Quest", "Threads"],
    values: ["Move fast", "Be bold", "Focus on impact", "Be open", "Build social value"],
  },
  "Amazon": {
    culture: "Amazon is obsessed with the 16 Leadership Principles. Every interview question maps to one or more LPs. Customer obsession is paramount.",
    pmFocus: "Working backwards from customers, writing press releases, defining metrics (input vs output), and demonstrating ownership. Use STAR format heavily.",
    sweFocus: "OA coding + onsite with LP-focused behavioral rounds. System design often involves distributed systems and AWS services.",
    products: ["Amazon Shopping", "Prime", "AWS", "Alexa", "Kindle", "Prime Video", "Ring"],
    values: ["Customer Obsession", "Ownership", "Invent and Simplify", "Bias for Action", "Dive Deep", "Deliver Results"],
    leadershipPrinciples: [
      "Customer Obsession", "Ownership", "Invent and Simplify", "Are Right, A Lot",
      "Learn and Be Curious", "Hire and Develop the Best", "Insist on the Highest Standards",
      "Think Big", "Bias for Action", "Frugality", "Earn Trust", "Dive Deep",
      "Have Backbone; Disagree and Commit", "Deliver Results", "Strive to be Earth's Best Employer",
      "Success and Scale Bring Broad Responsibility"
    ],
  },
  "Apple": {
    culture: "Apple values secrecy, attention to detail, design excellence, and end-to-end product thinking. They look for people who obsess over craft.",
    pmFocus: "Product craft, hardware-software integration, user experience perfection, and simplicity. Questions often focus on design decisions and trade-offs.",
    sweFocus: "Domain-specific technical depth, performance optimization, and platform expertise (iOS, macOS, etc.).",
    products: ["iPhone", "Mac", "iPad", "Apple Watch", "AirPods", "Apple Music", "iCloud", "App Store"],
    values: ["Design excellence", "Simplicity", "Integration", "Privacy", "Accessibility"],
  },
  "Microsoft": {
    culture: "Microsoft emphasizes growth mindset, inclusion, and empowering others. Satya Nadella transformed the culture to be more collaborative and learning-oriented.",
    pmFocus: "Enterprise + consumer product thinking, technical depth, platform ecosystem understanding, and AI/cloud integration.",
    sweFocus: "Coding, system design (Azure-scale), and growth mindset behavioral questions.",
    products: ["Windows", "Office 365", "Azure", "Teams", "LinkedIn", "GitHub", "Xbox", "Copilot"],
    values: ["Growth mindset", "Diverse & inclusive", "One Microsoft", "Making a difference"],
  },
  "OpenAI": {
    culture: "OpenAI is mission-driven around safe AGI development. They value research rigor, safety consciousness, and responsible AI development.",
    pmFocus: "AI product sense, understanding model capabilities and limitations, developer experience, and safety/alignment considerations.",
    sweFocus: "Strong ML/AI understanding, systems for training and serving, and research implementation skills.",
    products: ["ChatGPT", "GPT-4", "DALL-E", "Whisper", "API Platform", "Codex"],
    values: ["Safe AGI", "Research excellence", "Responsible deployment", "Broad benefit"],
  },
  "Perplexity": {
    culture: "Fast-moving startup reinventing search with AI. Values speed, technical excellence, and product intuition.",
    pmFocus: "Search and information retrieval product sense, AI-first UX, growth and monetization for a new category.",
    sweFocus: "LLM application development, retrieval systems, and startup velocity.",
    products: ["Perplexity Search", "Perplexity Pro", "API", "Copilot"],
    values: ["Speed", "Technical excellence", "User trust", "Knowledge democratization"],
  },
  "Coinbase": {
    culture: "Crypto-native culture with clear communication, long-term thinking, and regulatory awareness. Mission to increase economic freedom.",
    pmFocus: "Crypto product sense, regulatory understanding, mainstream adoption, and trust/security.",
    sweFocus: "Blockchain fundamentals, security-focused development, and high-reliability systems.",
    products: ["Coinbase Exchange", "Coinbase Wallet", "Coinbase Prime", "Base L2", "NFT Marketplace"],
    values: ["Clear communication", "Efficient execution", "Crypto-native", "Long-term thinking"],
  },
};

function getWorkExperienceContext(workExperience?: WorkExperience): string {
  if (!workExperience || !workExperience.currentRole) {
    return "";
  }

  let context = `\n## Candidate Background (USE THIS TO PERSONALIZE QUESTIONS):`;
  context += `\n- Current Role: ${workExperience.currentRole}`;
  
  if (workExperience.yearsExperience) {
    context += `\n- Experience: ${workExperience.yearsExperience} years`;
  }
  
  if (workExperience.keyProjects) {
    context += `\n- Key Projects: ${workExperience.keyProjects}`;
  }
  
  if (workExperience.biggestAchievement) {
    context += `\n- Notable Achievement: ${workExperience.biggestAchievement}`;
  }
  
  if (workExperience.technicalSkills) {
    context += `\n- Technical Skills: ${workExperience.technicalSkills}`;
  }

  context += `\n\n**IMPORTANT**: Reference the candidate's actual experience in your questions and feedback. For behavioral questions, ask them to elaborate on their specific projects. Help them craft better STAR responses using their real experiences.`;

  return context;
}

function getCompanyContext(company: string): string {
  const knowledge = COMPANY_KNOWLEDGE[company as keyof typeof COMPANY_KNOWLEDGE];
  if (!knowledge) {
    return `You are interviewing for ${company}. Research and apply general tech interview best practices.`;
  }

  return `
## ${company} Interview Context:

**Company Culture**: ${knowledge.culture}

**Interview Focus**: ${knowledge.pmFocus || knowledge.sweFocus}

**Key Products to Reference**: ${knowledge.products.join(", ")}

**Core Values**: ${knowledge.values.join(", ")}

${"leadershipPrinciples" in knowledge ? `**Leadership Principles** (for Amazon): ${(knowledge as any).leadershipPrinciples.slice(0, 8).join(", ")}, and more...` : ""}

Use this context to make questions authentic to ${company}'s interview style. Reference their specific products, values, and culture in your questions and feedback.
`;
}

function getInterviewTypePrompt(roleType: string, interviewType: string, company: string): string {
  const isAmazon = company === "Amazon";
  const isGoogle = company === "Google";
  const isMeta = company === "Meta";
  const isOpenAI = company === "OpenAI";
  const isPerplexity = company === "Perplexity";
  const isCoinbase = company === "Coinbase";

  if (roleType === "product") {
    switch (interviewType) {
      case "product_sense":
        return `Focus on PRODUCT SENSE questions:
- Ask the candidate to improve or design features for ${company}'s products
- Probe for user-first thinking, problem framing, and creative solutions
- ${isGoogle ? "Look for 10x thinking and ability to think at massive scale" : ""}
- ${isMeta ? "Focus on social features and designing for billions of users" : ""}
- ${isAmazon ? "Apply 'Working Backwards' methodology - start with customer need" : ""}
- ${isOpenAI ? "Consider AI capabilities, limitations, and responsible deployment" : ""}
- Provide framework suggestions (e.g., user segments, use cases, prioritization)`;

      case "analytical":
      case "metrics":
        return `Focus on METRICS & ANALYTICS questions:
- Ask about defining success metrics for products
- Present metric drop/increase scenarios to debug
- Discuss A/B testing approaches
- ${isAmazon ? "Distinguish between input metrics (controllable) and output metrics (results)" : ""}
- ${isMeta ? "Focus on growth metrics, engagement, and network effects" : ""}
- Help them think through leading vs lagging indicators`;

      case "strategy":
        return `Focus on PRODUCT STRATEGY questions:
- Market entry, competitive positioning, long-term vision
- ${isAmazon ? "Apply 'Think Big' and 'Customer Obsession' principles" : ""}
- ${isGoogle ? "Consider platform ecosystem and 10x opportunities" : ""}
- Ask about competitive threats and strategic responses
- Evaluate business model and monetization thinking`;

      case "execution":
      case "leadership":
        return `Focus on EXECUTION & LEADERSHIP questions:
- Cross-functional collaboration scenarios
- Prioritization and trade-off decisions
- ${isMeta ? "Emphasize 'Move Fast' and shipping velocity" : ""}
- ${isAmazon ? "Apply 'Bias for Action' and 'Deliver Results'" : ""}
- Stakeholder management and influence without authority`;

      case "behavioral":
      case "googleyness":
      case "leadership_principles":
        return `Focus on BEHAVIORAL questions:
- Use STAR format (Situation, Task, Action, Result)
- ${isAmazon ? "MAP EVERY QUESTION TO A LEADERSHIP PRINCIPLE and evaluate against it" : ""}
- ${isGoogle ? "Look for 'Googleyness': intellectual humility, handling ambiguity, collaboration" : ""}
- ${isMeta ? "Evaluate for Meta's values: bold decisions, impact focus, openness" : ""}
- Ask about failures, conflicts, and learning moments
- Probe for self-awareness and growth`;

      case "product_craft":
      case "user_experience":
        return `Focus on PRODUCT CRAFT & UX questions:
- Attention to detail in design decisions
- End-to-end user experience thinking
- Accessibility and inclusivity
- ${company === "Apple" ? "Emphasize simplicity, delight, and hardware-software integration" : ""}`;

      case "technical":
        return `Focus on TECHNICAL DEPTH questions:
- Understanding of technical constraints and trade-offs
- ${isOpenAI || isPerplexity ? "AI/ML concepts, LLM capabilities and limitations" : ""}
- ${isCoinbase ? "Blockchain fundamentals, smart contracts, DeFi" : ""}
- Platform architecture decisions`;

      case "safety":
        return `Focus on AI SAFETY & ALIGNMENT:
- Responsible AI deployment considerations
- User trust and safety mechanisms
- Ethical implications of AI products
- Risk mitigation strategies`;

      case "regulatory":
        return `Focus on COMPLIANCE & REGULATORY:
- Understanding of regulatory landscape
- Trust and safety in crypto/finance
- Building compliant products
- Risk management`;

      case "growth":
        return `Focus on GROWTH & MONETIZATION:
- User acquisition and retention strategies
- Viral loops and network effects
- Pricing and business model
- Market expansion`;

      default:
        return `Conduct a comprehensive interview covering multiple areas.`;
    }
  } else {
    // Software Engineer
    switch (interviewType) {
      case "coding":
        return `Focus on CODING questions:
- Present algorithmic problems appropriate for ${company}
- Evaluate problem-solving approach, not just solution
- Discuss time/space complexity
- Ask about edge cases and testing
- ${isGoogle ? "Emphasize clean, readable code with optimal solutions" : ""}
- ${isMeta ? "Focus on practical coding with real-world constraints" : ""}
- ${isAmazon ? "Connect coding approach to 'Dive Deep' and 'Insist on Highest Standards'" : ""}`;

      case "system_design":
        return `Focus on SYSTEM DESIGN questions:
- Design scalable distributed systems
- ${isGoogle ? "Think at Google scale - billions of users, petabytes of data" : ""}
- ${isMeta ? "Design for billions of concurrent users, real-time updates" : ""}
- ${isAmazon ? "Consider AWS services and microservices architecture" : ""}
- ${company === "Microsoft" ? "Consider Azure services and enterprise scale" : ""}
- ${isOpenAI ? "ML systems, training infrastructure, model serving" : ""}
- ${isPerplexity ? "Search/retrieval systems, RAG architecture" : ""}
- ${isCoinbase ? "High-reliability financial systems, blockchain integration" : ""}
- Discuss trade-offs, bottlenecks, and failure modes`;

      case "behavioral":
      case "googleyness":
      case "leadership_principles":
      case "bar_raiser":
        return `Focus on BEHAVIORAL questions:
- Use STAR format evaluation
- ${isAmazon ? "Deep dive on Leadership Principles - especially Ownership, Dive Deep, Deliver Results" : ""}
- ${isGoogle ? "Assess Googleyness: collaboration, handling ambiguity, learning orientation" : ""}
- ${isMeta ? "Evaluate for impact orientation and collaboration" : ""}
- Ask about technical disagreements, debugging production issues
- Explore leadership and mentorship experiences`;

      case "technical":
      case "technical_depth":
      case "domain":
        return `Focus on TECHNICAL DISCUSSION:
- Deep dive on past projects and architecture decisions
- Discuss debugging approaches and production incidents
- Code review philosophy and best practices
- ${isOpenAI ? "ML/AI system design and research implementation" : ""}
- ${isCoinbase ? "Security-focused development, blockchain protocols" : ""}`;

      case "ml_depth":
      case "ml":
        return `Focus on ML/AI DEPTH:
- LLM fundamentals, training, fine-tuning
- Model evaluation and improvement
- ML system design and infrastructure
- Research paper understanding
- Practical ML engineering`;

      case "blockchain":
        return `Focus on BLOCKCHAIN & CRYPTO:
- Smart contract development
- DeFi protocols and mechanisms
- Security considerations
- On-chain data and indexing`;

      case "growth_mindset":
        return `Focus on GROWTH MINDSET:
- Learning new technologies quickly
- Handling failure and setbacks
- Collaboration and mentorship
- Continuous improvement`;

      case "startup":
        return `Focus on STARTUP FIT:
- Speed and scrappiness
- Wearing multiple hats
- Ownership and initiative
- Building with limited resources`;

      case "mission":
        return `Focus on MISSION ALIGNMENT:
- Understanding of AI safety challenges
- Responsible AI development
- Research-engineering collaboration
- Long-term thinking`;

      default:
        return `Conduct a comprehensive technical interview.`;
    }
  }
}

function getSystemPrompt(context: InterviewContext): string {
  const { roleType, level, company, interviewType, workExperience } = context;
  
  const roleTitle = roleType === "product" ? "Product Manager" : "Software Engineer";
  const companyContext = getCompanyContext(company);
  const interviewTypeContext = getInterviewTypePrompt(roleType, interviewType || "mixed", company);
  const workExpContext = getWorkExperienceContext(workExperience);

  return `You are an expert ${company} interviewer. Your responses must be CONCISE and ACTIONABLE.

${companyContext}

## Interview Focus:
${interviewTypeContext}
${workExpContext}

## CRITICAL RESPONSE RULES:

### For Questions:
- Ask ONE clear, specific question
- Keep the question under 3 sentences
- No preamble or lengthy context

### For Feedback (after candidate answers):
Use this EXACT format - keep each section to 1-2 sentences max:

**Score: X/10**

✅ **Good:** [One specific strength - what they nailed]

⚠️ **Fix:** [One specific improvement with HOW to fix it]

📝 **Try this:** "[A 1-2 sentence example phrase they could use]"

---
**Next question:** [Your follow-up or new question]

### Key Principles:
1. **Be direct** - No filler words, no "Great question!", no lengthy intros
2. **Be specific** - Reference exact words they used, exact metrics they should add
3. **Be actionable** - Every piece of feedback should be immediately usable
4. **One thing at a time** - Focus on the MOST important improvement, not everything
5. **Use their background** - Reference their ${workExperience?.currentRole || 'role'} and projects when relevant

### Special Commands (respond concisely):
- "help" / "hint" → Give a 2-3 bullet framework, no full answer
- "example" → Show a sample answer structure (50 words max)
- "skip" → Move to next question immediately
- "harder" / "easier" → Adjust difficulty and acknowledge briefly

### Level Calibration for ${level}:
- Adjust complexity and expected depth appropriately
- ${level.includes("senior") || level.includes("principal") || level.includes("director") || level.includes("staff") ? "Expect strategic thinking, cross-functional examples, quantified impact" : "Focus on fundamentals, clear thinking, growth potential"}

Start with a brief 1-sentence intro as the ${company} interviewer, then ask your first ${interviewType || "interview"} question.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, action } = await req.json();
    logStep("Request received", { action, company: context?.company, interviewType: context?.interviewType });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Main chat flow
    const systemPrompt = getSystemPrompt(context);
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
    ];

    logStep("Calling AI API", { messageCount: apiMessages.length, company: context.company });

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
