import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[COVER-LETTER] ${step}`, details ? JSON.stringify(details) : "");
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

  // If access token provided, verify it
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

  // If email provided, verify via email
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
      candidateName,
      candidateEmail,
      candidatePhone,
      companyName,
      hiringManagerName,
      selfProjection,
      coverLetterLength = "medium", // "short", "medium", "detailed"
      email,
      accessToken
    } = await req.json();

    logStep("Request received", { 
      hasResume: !!resumeText, 
      hasJob: !!jobDescription,
      candidateName,
      coverLetterLength,
      hasEmail: !!email
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

    // Adjust word count based on length preference
    const lengthConfig = {
      short: { words: "200-250", paragraphs: "3 short paragraphs", style: "concise and punchy" },
      medium: { words: "300-400", paragraphs: "4 paragraphs", style: "balanced and professional" },
      detailed: { words: "500-600", paragraphs: "5-6 paragraphs", style: "comprehensive and thorough" }
    };
    
    const config = lengthConfig[coverLetterLength as keyof typeof lengthConfig] || lengthConfig.medium;

    const systemPrompt = `You are an expert cover letter writer who crafts compelling, personalized cover letters that get interviews. 

Your cover letters:
1. Open with a hook that shows genuine interest and knowledge about the company
2. Connect the candidate's specific experience to the job requirements
3. Demonstrate measurable impact and achievements
4. Show personality while remaining professional
5. End with a clear call to action

LENGTH PREFERENCE: ${coverLetterLength.toUpperCase()}
- Target: ${config.words} words
- Structure: ${config.paragraphs}
- Style: ${config.style}

STYLE RULES:
- Be confident but not arrogant
- Be specific, not generic
- Use the candidate's authentic voice
- Make every sentence count

HARD CONSTRAINTS (MANDATORY - VIOLATION WILL CAUSE REJECTION):
- Do NOT include the candidate's name, email, date, address, subject line, or placeholders.
- Start the output DIRECTLY with the salutation ("Dear …").
- Never output bracketed placeholders like [Date], [Your Name], [Address], [Company], or any metadata.
- Do NOT include "Re:" or any subject line.
- End with ONLY "Sincerely," - nothing after it.
- The UI handles all header/letterhead information - your job is ONLY the letter body.`;

    // Only pass minimal context to AI - NO personal data that could leak into output
    const userPrompt = `Write a ${coverLetterLength.toUpperCase()} cover letter for a candidate applying to ${companyName || "this company"} for a role.

ROLE CONTEXT:
${companyName ? `Company: ${companyName}` : ""}
${hiringManagerName ? `Address the letter to: ${hiringManagerName}` : "Address to: Hiring Manager"}

CANDIDATE'S RESUME HIGHLIGHTS:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${selfProjection ? `CANDIDATE'S SELF-PROJECTION (use to make the letter authentic):
${selfProjection}` : ""}

LENGTH: ${coverLetterLength.toUpperCase()}
${coverLetterLength === "short" ? `- Maximum 250 words, 3 paragraphs, concise and punchy` : coverLetterLength === "detailed" ? `- 500-600 words, 5-6 paragraphs, comprehensive` : `- 300-400 words, 4 paragraphs, balanced`}

OUTPUT FORMAT (CRITICAL):
- Start EXACTLY with: "${hiringManagerName ? `Dear ${hiringManagerName},` : "Dear Hiring Manager,"}"
- Body paragraphs only
- End EXACTLY with: "Sincerely,"
- NO name, email, date, address, phone, subject line, or ANY header content
- NO placeholders like [Date], [Your Name], [Address]
- NOTHING after "Sincerely,"`;

    logStep("Calling AI for cover letter generation", { length: coverLetterLength });

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
    let coverLetter = data.choices?.[0]?.message?.content;

    if (!coverLetter) {
      throw new Error("No content in AI response");
    }

    // PLACEHOLDER SANITIZATION - Check for forbidden patterns and clean if found
    const forbiddenPatterns = [
      /\[Date\]/gi,
      /\[Your Name\]/gi,
      /\[Your Address\]/gi,
      /\[City,?\s*State,?\s*Zip\]/gi,
      /\[Company Address\]/gi,
      /\[Hiring Manager\]/gi,
      /\[Phone\]/gi,
      /\[Email\]/gi,
      /\[Address\]/gi,
      /if known/gi,
      /otherwise omit/gi,
      /\[.*?\]/g, // Any remaining bracketed placeholders
    ];

    let containsForbidden = false;
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(coverLetter)) {
        containsForbidden = true;
        // Remove the forbidden pattern
        coverLetter = coverLetter.replace(pattern, '').trim();
      }
    }

    if (containsForbidden) {
      logStep("Sanitized forbidden placeholders from output");
    }

    // Clean up any leading lines before "Dear" - ensure it starts with salutation
    const dearIndex = coverLetter.indexOf("Dear ");
    if (dearIndex > 0) {
      coverLetter = coverLetter.substring(dearIndex);
      logStep("Trimmed content before salutation");
    }

    // Clean up anything after "Sincerely," on the same line or following lines that look like signatures
    const sincerelyMatch = coverLetter.match(/Sincerely,?\s*\n?/i);
    if (sincerelyMatch) {
      const sincerelyIndex = coverLetter.indexOf(sincerelyMatch[0]);
      coverLetter = coverLetter.substring(0, sincerelyIndex + sincerelyMatch[0].length).trim();
      // Ensure it ends with just "Sincerely,"
      if (!coverLetter.endsWith("Sincerely,")) {
        coverLetter = coverLetter.replace(/Sincerely,?\s*$/i, "Sincerely,");
      }
    }

    // Remove any blank lines at the start
    coverLetter = coverLetter.replace(/^\s*\n+/, '');

    logStep("Cover letter generated successfully", { length: coverLetterLength, sanitized: containsForbidden });

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
