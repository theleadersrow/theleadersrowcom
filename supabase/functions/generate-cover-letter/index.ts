import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[COVER-LETTER] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      resumeText, 
      jobDescription, 
      candidateName,
      candidateEmail,
      candidatePhone,
      companyName,
      hiringManagerName,
      selfProjection
    } = await req.json();

    logStep("Request received", { 
      hasResume: !!resumeText, 
      hasJob: !!jobDescription,
      candidateName 
    });

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

    const systemPrompt = `You are an expert cover letter writer who crafts compelling, personalized cover letters that get interviews. 

Your cover letters:
1. Open with a hook that shows genuine interest and knowledge about the company
2. Connect the candidate's specific experience to the job requirements
3. Demonstrate measurable impact and achievements
4. Show personality while remaining professional
5. End with a clear call to action

STYLE RULES:
- Be confident but not arrogant
- Be specific, not generic
- Use the candidate's authentic voice
- Keep it concise (under 400 words)
- Make every sentence count`;

    const userPrompt = `Write a compelling cover letter for this candidate applying to this role.

CANDIDATE INFORMATION:
Name: ${candidateName || "[Candidate Name]"}
${candidateEmail ? `Email: ${candidateEmail}` : ""}
${candidatePhone ? `Phone: ${candidatePhone}` : ""}

${companyName ? `COMPANY: ${companyName}` : ""}
${hiringManagerName ? `HIRING MANAGER: ${hiringManagerName}` : ""}

CANDIDATE'S RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${selfProjection ? `HOW THE CANDIDATE WANTS TO BE PERCEIVED:
${selfProjection}

Use this self-projection to make the cover letter authentic to who they are.` : ""}

INSTRUCTIONS:
1. Start with a compelling opening that shows knowledge of the company/role
2. Highlight 2-3 specific achievements from the resume that match the job requirements
3. Show enthusiasm for the specific role, not just any job
4. Include a clear call to action
5. Keep it under 400 words
6. Make it sound human and authentic, not AI-generated

Return ONLY the cover letter text, properly formatted with:
- Header with candidate contact info
- Date
- Greeting
- Body paragraphs
- Professional closing`;

    logStep("Calling AI for cover letter generation");

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI gateway error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. AI service unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const coverLetter = data.choices?.[0]?.message?.content;

    if (!coverLetter) {
      throw new Error("No content in AI response");
    }

    logStep("Cover letter generated successfully");

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
