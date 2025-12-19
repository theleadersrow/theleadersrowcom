import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[INTERVIEW-PREP] ${step}`, details ? JSON.stringify(details) : "");
};

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
      email,
      accessToken
    } = await req.json();

    logStep("Request received", { 
      hasResume: !!resumeText, 
      hasJob: !!jobDescription,
      companyName,
      roleTitle
    });

    // Verify tool access
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
