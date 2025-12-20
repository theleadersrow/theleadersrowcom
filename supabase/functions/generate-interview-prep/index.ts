import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[INTERVIEW-PREP] ${step}`, details ? JSON.stringify(details) : "");
};

// Helper function for default preview questions by role - returns categories with questions
function getDefaultPreviewCategories(role: string) {
  const roleKeywords = role.toLowerCase();
  
  if (roleKeywords.includes("product") || roleKeywords.includes("pm")) {
    return [
      {
        name: "Product Sense & Problem Framing",
        description: "How you think, not what you know — customer empathy, structured thinking, tradeoffs, clarity under ambiguity",
        questions: [
          { question: "How would you identify the biggest problem to solve for [product/company] right now?", category: "Product Sense", difficulty: "Hard" as const },
          { question: "Tell me about a time you worked on a problem that was poorly defined. How did you bring clarity?", category: "Product Sense", difficulty: "Hard" as const },
          { question: "How do you decide what not to build?", category: "Product Sense", difficulty: "Medium" as const },
          { question: "If usage is flat but revenue is growing, what questions would you ask first?", category: "Product Sense", difficulty: "Hard" as const },
        ]
      },
      {
        name: "Product Strategy & Vision",
        description: "Your ability to think long-term and at the right altitude — strategic judgment, prioritization, business alignment, executive thinking",
        questions: [
          { question: "How do you define product strategy, and how is it different from a roadmap?", category: "Product Strategy", difficulty: "Medium" as const },
          { question: "Walk me through how you would set a 12–18 month vision for this product.", category: "Product Strategy", difficulty: "Hard" as const },
          { question: "Tell me about a strategic bet you made that didn't pay off. What did you learn?", category: "Product Strategy", difficulty: "Hard" as const },
          { question: "How do you align product strategy with company goals when there's conflict?", category: "Product Strategy", difficulty: "Hard" as const },
        ]
      },
      {
        name: "Execution & Decision-Making",
        description: "Can you ship and deliver impact consistently? — ownership, prioritization under constraints, bias to action, judgment calls",
        questions: [
          { question: "Describe a complex product you shipped end-to-end. What were the hardest decisions?", category: "Execution", difficulty: "Hard" as const },
          { question: "How do you prioritize when everything feels urgent?", category: "Execution", difficulty: "Medium" as const },
          { question: "Tell me about a time you had to make a decision with incomplete data.", category: "Execution", difficulty: "Hard" as const },
          { question: "How do you balance speed vs quality?", category: "Execution", difficulty: "Medium" as const },
        ]
      },
      {
        name: "Data, Metrics & Business Impact",
        description: "Do you understand what actually moves the business? — metric thinking, outcome focus, analytical rigor, business acumen",
        questions: [
          { question: "What metrics do you use to measure success for your product?", category: "Metrics", difficulty: "Medium" as const },
          { question: "How do you choose a North Star metric?", category: "Metrics", difficulty: "Hard" as const },
          { question: "Tell me about a time data changed your original product direction.", category: "Metrics", difficulty: "Hard" as const },
          { question: "If a key metric drops suddenly, how do you investigate?", category: "Metrics", difficulty: "Hard" as const },
        ]
      },
      {
        name: "Stakeholder Management & Influence",
        description: "How you lead without authority — communication, alignment, conflict resolution, leadership maturity",
        questions: [
          { question: "Tell me about a time you disagreed with engineering or leadership. How did you handle it?", category: "Stakeholder", difficulty: "Hard" as const },
          { question: "How do you influence decisions when you don't have direct authority?", category: "Stakeholder", difficulty: "Medium" as const },
          { question: "Describe a difficult stakeholder and how you built alignment.", category: "Stakeholder", difficulty: "Hard" as const },
          { question: "How do you communicate tradeoffs to executives?", category: "Stakeholder", difficulty: "Medium" as const },
        ]
      },
      {
        name: "Leadership, Growth & Product Judgment",
        description: "What makes you trusted at the next level (Senior+ roles) — people leadership, judgment, mentorship, scope ownership",
        questions: [
          { question: "How do you develop and coach other PMs?", category: "Leadership", difficulty: "Hard" as const },
          { question: "What distinguishes a Senior PM from a Principal or Director?", category: "Leadership", difficulty: "Medium" as const },
          { question: "Tell me about a time you raised the quality bar for your team.", category: "Leadership", difficulty: "Hard" as const },
          { question: "How do you scale yourself as product scope increases?", category: "Leadership", difficulty: "Hard" as const },
        ]
      }
    ];
  } else if (roleKeywords.includes("engineer") || roleKeywords.includes("developer")) {
    return [
      {
        name: "Behavioral",
        description: "Questions about your past experiences and teamwork",
        questions: [
          { question: "Tell me about a time you had to learn a new technology quickly.", category: "Behavioral", difficulty: "Medium" as const },
          { question: "Describe a situation where you disagreed with a technical decision.", category: "Behavioral", difficulty: "Medium" as const },
          { question: "How do you handle tight deadlines with competing priorities?", category: "Behavioral", difficulty: "Medium" as const },
        ]
      },
      {
        name: "Technical Problem Solving",
        description: "Questions about your approach to solving complex problems",
        questions: [
          { question: "Describe a complex bug you debugged. What was your approach?", category: "Technical", difficulty: "Hard" as const },
          { question: "How do you approach breaking down a large technical problem?", category: "Technical", difficulty: "Medium" as const },
          { question: "Walk me through optimizing a slow database query.", category: "Technical", difficulty: "Hard" as const },
        ]
      },
      {
        name: "System Design",
        description: "Questions about designing scalable systems",
        questions: [
          { question: "Design a URL shortener service.", category: "System Design", difficulty: "Hard" as const },
          { question: "How would you design a real-time notification system?", category: "System Design", difficulty: "Hard" as const },
          { question: "What factors do you consider when choosing between SQL and NoSQL?", category: "System Design", difficulty: "Medium" as const },
        ]
      },
      {
        name: "Code Quality & Best Practices",
        description: "Questions about maintainability and engineering practices",
        questions: [
          { question: "How do you ensure code quality in your team?", category: "Best Practices", difficulty: "Medium" as const },
          { question: "What's your approach to technical debt?", category: "Best Practices", difficulty: "Medium" as const },
          { question: "How do you decide when to refactor vs. rewrite?", category: "Best Practices", difficulty: "Hard" as const },
        ]
      }
    ];
  } else if (roleKeywords.includes("manager") || roleKeywords.includes("director") || roleKeywords.includes("lead")) {
    return [
      {
        name: "Behavioral",
        description: "Questions about your leadership experiences",
        questions: [
          { question: "Tell me about a time you had to deliver difficult feedback.", category: "Behavioral", difficulty: "Hard" as const },
          { question: "Describe a situation where you had to make an unpopular decision.", category: "Behavioral", difficulty: "Hard" as const },
          { question: "How do you build trust with a new team?", category: "Behavioral", difficulty: "Medium" as const },
        ]
      },
      {
        name: "Team Leadership",
        description: "Questions about managing and developing teams",
        questions: [
          { question: "How do you handle underperforming team members?", category: "Leadership", difficulty: "Hard" as const },
          { question: "What's your approach to hiring and building a team?", category: "Leadership", difficulty: "Medium" as const },
          { question: "How do you create an environment of psychological safety?", category: "Leadership", difficulty: "Hard" as const },
        ]
      },
      {
        name: "Strategy & Vision",
        description: "Questions about strategic thinking and planning",
        questions: [
          { question: "How do you balance strategic planning with day-to-day execution?", category: "Strategy", difficulty: "Medium" as const },
          { question: "How do you align your team's work with company objectives?", category: "Strategy", difficulty: "Medium" as const },
          { question: "Describe how you've driven organizational change.", category: "Strategy", difficulty: "Hard" as const },
        ]
      },
      {
        name: "Stakeholder Management",
        description: "Questions about working with cross-functional partners",
        questions: [
          { question: "Tell me about a time you had to influence without authority.", category: "Influence", difficulty: "Hard" as const },
          { question: "How do you manage conflicting priorities from different stakeholders?", category: "Influence", difficulty: "Hard" as const },
          { question: "How do you communicate bad news to executives?", category: "Influence", difficulty: "Medium" as const },
        ]
      }
    ];
  }
  
  return [
    {
      name: "Behavioral",
      description: "Questions about your past experiences and work style",
      questions: [
        { question: "Tell me about yourself and your career journey.", category: "Behavioral", difficulty: "Easy" as const },
        { question: "Describe a challenge you faced and how you overcame it.", category: "Behavioral", difficulty: "Medium" as const },
        { question: "What's your biggest professional achievement?", category: "Behavioral", difficulty: "Medium" as const },
      ]
    },
    {
      name: "Motivation & Goals",
      description: "Questions about your career aspirations",
      questions: [
        { question: "Why are you interested in this role?", category: "Motivation", difficulty: "Medium" as const },
        { question: "Where do you see yourself in 5 years?", category: "Goals", difficulty: "Easy" as const },
        { question: "What motivates you in your work?", category: "Motivation", difficulty: "Easy" as const },
      ]
    },
    {
      name: "Problem Solving",
      description: "Questions about how you approach challenges",
      questions: [
        { question: "How do you handle multiple competing priorities?", category: "Problem Solving", difficulty: "Medium" as const },
        { question: "Describe a time you had to learn something new quickly.", category: "Problem Solving", difficulty: "Medium" as const },
        { question: "How do you approach unfamiliar problems?", category: "Problem Solving", difficulty: "Medium" as const },
      ]
    },
    {
      name: "Teamwork",
      description: "Questions about collaboration and communication",
      questions: [
        { question: "How do you handle disagreements with colleagues?", category: "Teamwork", difficulty: "Medium" as const },
        { question: "Describe your ideal work environment.", category: "Teamwork", difficulty: "Easy" as const },
        { question: "How do you prefer to communicate with your team?", category: "Teamwork", difficulty: "Easy" as const },
      ]
    }
  ];
}

// Verify tool access by email or access token
async function verifyToolAccess(
  email: string | undefined,
  accessToken: string | undefined,
  toolType: string
): Promise<{ valid: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (accessToken) {
    const { data: purchase, error } = await supabase
      .from("tool_purchases")
      .select("*")
      .eq("access_token", accessToken)
      .eq("tool_type", toolType)
      .eq("status", "active")
      .maybeSingle();

    if (error || !purchase) {
      return { valid: false, error: "Invalid access token" };
    }

    if (new Date(purchase.expires_at) < new Date()) {
      return { valid: false, error: "Access has expired" };
    }

    return { valid: true };
  }

  if (email) {
    const { data: purchase, error } = await supabase
      .from("tool_purchases")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("tool_type", toolType)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !purchase) {
      return { valid: false, error: "No active access found for this email" };
    }

    return { valid: true };
  }

  return { valid: false, error: "Email or access token required" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      resumeText, 
      jobDescription, 
      companyName,
      roleTitle,
      targetRole,
      email,
      accessToken,
      previewOnly = false
    } = await req.json();

    logStep("Request received", { 
      hasResume: !!resumeText, 
      hasJob: !!jobDescription,
      companyName,
      roleTitle,
      targetRole,
      previewOnly
    });

    // If preview mode, skip access verification and return categorized questions
    if (previewOnly) {
      logStep("Preview mode - generating categorized questions");
      
      // Return categorized questions for the role
      const questionCategories = getDefaultPreviewCategories(targetRole || roleTitle || "");
      return new Response(JSON.stringify({ questionCategories }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Full mode - verify access
    const accessCheck = await verifyToolAccess(email, accessToken, "resume_suite");
    if (!accessCheck.valid) {
      logStep("Access denied", { error: accessCheck.error });
      return new Response(JSON.stringify({ error: accessCheck.error || "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "Resume and job description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert interview coach who helps candidates prepare for job interviews. You analyze resumes and job descriptions to predict the most likely interview questions and provide strategic answers.

Your task is to generate interview preparation content that:
1. Focuses on questions that directly relate to the gap between the candidate's experience and job requirements
2. Provides specific, tailored answers using the candidate's actual experience
3. Includes behavioral questions (STAR format) based on the candidate's background
4. Anticipates concerns a hiring manager might have and addresses them proactively
5. Helps the candidate articulate their unique value proposition

You must return a valid JSON object with this exact structure:
{
  "roleOverview": {
    "title": "string - the role title",
    "company": "string - company name if known",
    "keyFocusAreas": ["string array - 3-5 main areas the interview will likely focus on"]
  },
  "interviewQuestions": [
    {
      "category": "string - one of: 'Experience & Background', 'Behavioral', 'Technical/Role-Specific', 'Situational', 'Culture Fit'",
      "question": "string - the likely interview question",
      "whyTheyAsk": "string - brief explanation of what the interviewer is looking for",
      "suggestedAnswer": "string - a strong answer using the candidate's actual experience (150-250 words)",
      "keyPoints": ["string array - 3-4 bullet points to remember"],
      "followUpQuestions": ["string array - 2-3 potential follow-up questions"]
    }
  ],
  "questionsToAsk": [
    {
      "question": "string - a thoughtful question for the candidate to ask",
      "purpose": "string - why this question demonstrates interest/fit"
    }
  ],
  "potentialConcerns": [
    {
      "concern": "string - a potential concern the interviewer might have",
      "howToAddress": "string - how to proactively address this concern"
    }
  ],
  "preparationTips": ["string array - 5-7 specific tips for this particular interview"]
}

Generate 8-10 interview questions covering different categories. Be specific and use actual details from the resume.`;

    const userPrompt = `Generate interview preparation content for this candidate and role.

CANDIDATE'S RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `COMPANY: ${companyName}` : ''}
${roleTitle ? `ROLE TITLE: ${roleTitle}` : ''}

Analyze the resume against the job requirements and generate:
1. 8-10 likely interview questions with tailored answers using the candidate's actual experience
2. 5 thoughtful questions for the candidate to ask the interviewer
3. 3-4 potential concerns and how to address them
4. Preparation tips specific to this role

Make all answers specific and actionable, drawing from the candidate's real experience shown in the resume.`;

    logStep("Calling AI for interview prep generation");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI API error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    logStep("AI response received", { contentLength: content.length });

    // Parse the JSON response
    let interviewPrep;
    try {
      // Extract JSON from the response (in case there's markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        interviewPrep = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      logStep("JSON parse error, attempting to extract", { error: String(parseError) });
      // Try to extract structured data even if JSON is malformed
      interviewPrep = {
        roleOverview: {
          title: roleTitle || "Position",
          company: companyName || "Company",
          keyFocusAreas: ["Experience alignment", "Technical skills", "Cultural fit"]
        },
        interviewQuestions: [],
        questionsToAsk: [],
        potentialConcerns: [],
        preparationTips: ["Review the job description thoroughly", "Prepare STAR format answers", "Research the company"]
      };
    }

    logStep("Interview prep generated successfully", { 
      questionCount: interviewPrep.interviewQuestions?.length || 0 
    });

    return new Response(JSON.stringify(interviewPrep), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate interview prep";
    logStep("Error generating interview prep", { error: String(error) });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});