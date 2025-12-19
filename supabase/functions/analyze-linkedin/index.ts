import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Update usage tracking
    await supabase
      .from("tool_purchases")
      .update({
        usage_count: (purchase.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

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

    // Update usage tracking
    await supabase
      .from("tool_purchases")
      .update({
        usage_count: (purchase.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    return { valid: true };
  }

  return { valid: false, error: "Email or access token required" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, targetIndustry, targetRole, targetJobDescription, profileText, resumeText, requestType, currentHeadline, currentAbout, email, accessToken } = await req.json();
    
    // Verify tool access
    const accessCheck = await verifyToolAccess(email, accessToken, "linkedin_signal");
    if (!accessCheck.valid) {
      console.log("Access denied:", accessCheck.error);
      return new Response(JSON.stringify({ error: accessCheck.error || "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("LinkedIn analysis request:", { linkedinUrl, targetIndustry, targetRole, requestType, hasResume: !!resumeText, hasJobDesc: !!targetJobDescription });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const jobContext = targetJobDescription 
      ? `\n\nThe user is specifically targeting this job:\n${targetJobDescription}\n\nUse this job description to tailor your analysis and suggestions to match the specific requirements.`
      : "";

    if (requestType === "score") {
      // Initial scoring analysis
      const systemPrompt = `You are an expert LinkedIn profile analyst and recruiter. Analyze LinkedIn profiles from the perspective of recruiters and hiring managers in the ${targetIndustry} industry looking for ${targetRole} candidates.${jobContext}

IMPORTANT: All scores MUST be between 0 and 100. Never exceed 100.

Score profiles on these dimensions (0-100 scale only):
1. Headline Clarity: Does the headline clearly communicate their value proposition and role?
2. Role Positioning: Is their experience positioned to match ${targetRole} responsibilities?
3. Impact Language: Do they use quantified achievements and outcome-focused language?
4. Leadership Signal: Do they demonstrate leadership, influence, and strategic thinking?
5. Industry Alignment: Is their profile optimized for the ${targetIndustry} industry?
6. Visibility Score: How likely is this profile to appear in recruiter searches?

Also calculate the POTENTIAL IMPROVEMENT percentage - how much the profile could improve with optimizations.

Return your analysis as valid JSON with this exact structure:
{
  "overallScore": <number 0-100, never exceed 100>,
  "potentialImprovement": <percentage points the profile could improve, e.g. 25 means +25%>,
  "projectedScoreAfterChanges": <what the score could be after improvements, max 100>,
  "dimensions": {
    "headlineClarity": { "score": <0-100>, "analysis": "<brief 1-sentence analysis>" },
    "rolePositioning": { "score": <0-100>, "analysis": "<brief 1-sentence analysis>" },
    "impactLanguage": { "score": <0-100>, "analysis": "<brief 1-sentence analysis>" },
    "leadershipSignal": { "score": <0-100>, "analysis": "<brief 1-sentence analysis>" },
    "industryAlignment": { "score": <0-100>, "analysis": "<brief 1-sentence analysis>" },
    "visibilityScore": { "score": <0-100>, "analysis": "<brief 1-sentence analysis>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalGaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recruiterPerspective": "<1-2 sentences: what a recruiter would think>"
}`;

      const userPrompt = `Analyze this LinkedIn profile for someone targeting a ${targetRole} role in ${targetIndustry}:

LinkedIn URL: ${linkedinUrl}
Profile Content:
${profileText}

Provide a comprehensive scoring analysis.`;

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
        console.error("AI gateway error:", response.status, errorText);
        
        // Check for specific error types
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Service temporarily unavailable",
            error_type: "payment_required",
            message: "Our AI service has reached its usage limit. Please try again later."
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "High demand",
            error_type: "rate_limited",
            message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Failed to analyze LinkedIn profile");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse analysis response");
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      console.log("LinkedIn score analysis complete:", analysis.overallScore);

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (requestType === "improve") {
      // AI improvement suggestions - enhanced with resume context
      const resumeContext = resumeText 
        ? `\n\nIMPORTANT: The user has also provided their resume. Use the resume to:
1. Pull specific achievements, metrics, and outcomes from their work history
2. Identify strong bullet points that can be adapted for LinkedIn
3. Find quantified results and leadership examples from their actual experience
4. Ensure suggestions are authentic to their real career history

RESUME CONTENT:
${resumeText}` 
        : "";

      const jobDescContext = targetJobDescription
        ? `\n\nThe user is specifically targeting this job:\n${targetJobDescription}\n\nTailor ALL suggestions to match the keywords, requirements, and language from this job description.`
        : "";

      const systemPrompt = `You are an expert LinkedIn profile optimizer and career coach. Your job is to provide specific, actionable suggestions to improve a LinkedIn profile for someone targeting ${targetRole} positions in ${targetIndustry}.${jobDescContext}

ORGANIZE YOUR SUGGESTIONS BY LINKEDIN SECTION so users can easily copy-paste changes.

Focus on:
1. HEADLINE: Create a compelling headline that positions them for ${targetRole}
2. ABOUT SECTION: Craft a powerful summary that tells their career story
3. EXPERIENCE BULLETS: Rewrite key bullets with STAR format and metrics${resumeText ? " - USE THE RESUME to pull real achievements and metrics" : ""}

CRITICAL FOR EXPERIENCE REWRITES:
- ALWAYS include "companyRole" field with the format "Company Name — Job Title" so users know EXACTLY which experience to update
- If the company/role is not clear from the profile, make your best guess or label as "Most Recent Role", "Previous Role", etc.

Return your suggestions as valid JSON with this exact structure:
{
  "suggestedHeadline": "<new headline optimized for ${targetRole}>",
  "suggestedAbout": "<2-3 paragraph about section>",
  "keywordAdditions": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "experienceRewrites": [
    {
      "companyRole": "<Company Name — Job Title>",
      "original": "<original bullet or section>",
      "improved": "<rewritten with metrics and impact${resumeText ? " - incorporate specific achievements from resume" : ""}>",
      "whyBetter": "<explanation>"
    }
  ],
  "skillsToAdd": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "projectedScoreIncrease": {
    "headlineClarity": <projected score after changes, max 100>,
    "rolePositioning": <projected score after changes, max 100>,
    "impactLanguage": <projected score after changes, max 100>,
    "leadershipSignal": <projected score after changes, max 100>,
    "industryAlignment": <projected score after changes, max 100>,
    "visibilityScore": <projected score after changes, max 100>,
    "projectedOverallScore": <new projected overall score, max 100>
  },
  "priorityActions": [
    { "action": "<specific action>", "impact": "high|medium", "timeToComplete": "<time estimate>" }
  ]
}`;

      const userPrompt = `Provide specific improvement suggestions for this LinkedIn profile. The person is targeting a ${targetRole} role in ${targetIndustry}.

Current LinkedIn Profile:
${profileText}${resumeContext}

Provide detailed, specific suggestions that will significantly improve their profile visibility and appeal to recruiters.${resumeText ? " Make sure to leverage their actual resume achievements in your experience rewrites." : ""}
${targetJobDescription ? "IMPORTANT: Tailor all suggestions to match the provided target job description." : ""}`;

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
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Service temporarily unavailable",
            error_type: "payment_required",
            message: "Our AI service has reached its usage limit. Please try again later."
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "High demand",
            error_type: "rate_limited",
            message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Failed to generate improvement suggestions");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse suggestions response");
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      console.log("LinkedIn improvement suggestions complete");

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (requestType === "generate_headlines") {
      // Generate 5 headline options
      const systemPrompt = `You are an expert LinkedIn headline writer specializing in ${targetIndustry}. Create compelling, attention-grabbing headlines for professionals targeting ${targetRole} positions.${jobContext}

Headlines should:
- Be under 220 characters (LinkedIn limit)
- Include relevant keywords for SEO
- Convey unique value proposition
- Be professional yet memorable
- Use power words that resonate with recruiters

Return your headlines as valid JSON with this exact structure:
{
  "headlines": [
    {
      "headline": "<headline text>",
      "style": "<style description: e.g., 'Impact-focused', 'Keyword-rich', 'Value proposition'>",
      "whyItWorks": "<brief explanation of why this headline is effective>"
    }
  ]
}

Generate exactly 5 different headlines with different styles/approaches.`;

      const resumeContext = resumeText ? `\n\nUser's resume for context:\n${resumeText.substring(0, 2000)}` : "";

      const userPrompt = `Generate 5 compelling LinkedIn headline options for this professional targeting ${targetRole} in ${targetIndustry}.

Current profile/background:
${profileText.substring(0, 3000)}${resumeContext}

Current headline (if any): ${currentHeadline || "Not provided"}

Create 5 unique headlines with different approaches (impact-focused, keyword-rich, achievement-based, value proposition, creative).`;

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
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Service temporarily unavailable",
            error_type: "payment_required",
            message: "Our AI service has reached its usage limit. Please try again later."
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "High demand",
            error_type: "rate_limited",
            message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Failed to generate headlines");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse headlines response");
      }
      
      const result = JSON.parse(jsonMatch[0]);
      console.log("Generated headlines:", result.headlines?.length);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (requestType === "generate_about") {
      // Generate About section
      const systemPrompt = `You are an expert LinkedIn About section writer. Create a compelling, professional summary that tells the user's career story and positions them for ${targetRole} positions in ${targetIndustry}.${jobContext}

The About section should:
- Be 200-300 words (optimal length for engagement)
- Start with a strong hook that captures attention
- Tell their career story authentically
- Highlight key achievements and expertise
- Include relevant keywords for recruiter searches
- End with a clear call-to-action or statement of what they're seeking
- Use first person voice
- Be professional but personable

Return your response as valid JSON:
{
  "aboutSection": "<the complete About section text>",
  "keyElements": ["<element 1>", "<element 2>", "<element 3>"],
  "keywordsIncluded": ["<keyword 1>", "<keyword 2>", "<keyword 3>"]
}`;

      const resumeContext = resumeText ? `\n\nUser's resume for authentic achievements:\n${resumeText}` : "";

      const userPrompt = `Write a compelling LinkedIn About section for this professional targeting ${targetRole} in ${targetIndustry}.

Current profile:
${profileText}${resumeContext}

Current About section (if any): ${currentAbout || "Not provided"}

Create a powerful About section that will make recruiters want to connect.`;

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
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Service temporarily unavailable",
            error_type: "payment_required",
            message: "Our AI service has reached its usage limit. Please try again later."
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "High demand",
            error_type: "rate_limited",
            message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Failed to generate About section");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse About response");
      }
      
      const result = JSON.parse(jsonMatch[0]);
      console.log("Generated About section");

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (requestType === "generate_outreach") {
      // Generate personalized outreach messages
      const systemPrompt = `You are an expert LinkedIn networking strategist and cold outreach specialist. Create highly personalized, compelling connection requests and cold emails for someone targeting ${targetRole} positions in ${targetIndustry}.${jobContext}

Your outreach messages should:
- Be personalized and authentic, not generic
- Reference specific details from the user's background
- Have clear value propositions
- Be concise but impactful
- Follow best practices for LinkedIn connection requests (under 300 characters for connection notes)
- Be professional yet warm

Generate 3 different types of outreach:
1. Connection request to a recruiter at target companies
2. Connection request to a hiring manager/potential colleague
3. Cold email/InMail to a recruiter with more detail

Return your response as valid JSON:
{
  "recruiterConnection": {
    "message": "<connection request message under 300 chars>",
    "context": "<when to use this>",
    "tips": ["<tip 1>", "<tip 2>"]
  },
  "hiringManagerConnection": {
    "message": "<connection request message under 300 chars>",
    "context": "<when to use this>",
    "tips": ["<tip 1>", "<tip 2>"]
  },
  "coldEmail": {
    "subject": "<email subject line>",
    "message": "<full email body - 150-200 words>",
    "context": "<when to use this>",
    "tips": ["<tip 1>", "<tip 2>"]
  },
  "followUpMessage": {
    "message": "<follow-up after no response - under 200 chars>",
    "context": "<when to send this>"
  },
  "personalizationTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

      const resumeContext = resumeText ? `\n\nUser's resume for context:\n${resumeText.substring(0, 2000)}` : "";

      const userPrompt = `Generate personalized LinkedIn outreach messages for this professional targeting ${targetRole} in ${targetIndustry}.

Profile/Background:
${profileText.substring(0, 3000)}${resumeContext}

Create compelling, personalized outreach messages that this person can customize and send to recruiters and hiring managers.`;

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
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Service temporarily unavailable",
            error_type: "payment_required",
            message: "Our AI service has reached its usage limit. Please try again later."
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "High demand",
            error_type: "rate_limited",
            message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Failed to generate outreach messages");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse outreach response");
      }
      
      const result = JSON.parse(jsonMatch[0]);
      console.log("Generated outreach messages");

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (requestType === "recruiter_simulation") {
      // Recruiter search simulation
      const systemPrompt = `You are an expert in LinkedIn recruiter search algorithms and SEO. Analyze how a profile would appear in recruiter searches for ${targetRole} positions in ${targetIndustry}.${jobContext}

Evaluate:
1. Search keywords that would surface this profile
2. Missing keywords that recruiters commonly use
3. Profile ranking factors
4. Boolean search compatibility
5. InMail likelihood

Return your analysis as valid JSON:
{
  "searchVisibility": {
    "score": <0-100>,
    "ranking": "<e.g., 'Top 20%', 'Top 50%', etc.>"
  },
  "matchingKeywords": [
    { "keyword": "<keyword>", "frequency": "<how often it appears>", "importance": "high|medium|low" }
  ],
  "missingKeywords": [
    { "keyword": "<missing keyword>", "searchVolume": "high|medium|low", "recommendation": "<where to add it>" }
  ],
  "recruiterSearchQueries": [
    { "query": "<example boolean search>", "wouldMatch": true|false, "reason": "<why>" }
  ],
  "inMailLikelihood": {
    "score": <0-100>,
    "factors": ["<factor 1>", "<factor 2>"]
  },
  "topRecommendations": [
    { "action": "<specific action>", "impact": "<expected impact on visibility>" }
  ]
}`;

      const userPrompt = `Simulate how recruiters would find this profile when searching for ${targetRole} candidates in ${targetIndustry}.

Profile:
${profileText}

Analyze search visibility, keyword matching, and provide specific recommendations to improve recruiter discoverability.`;

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
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Service temporarily unavailable",
            error_type: "payment_required",
            message: "Our AI service has reached its usage limit. Please try again later."
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "High demand",
            error_type: "rate_limited",
            message: "Our AI service is experiencing high traffic. Please wait a moment and try again."
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error("Failed to run recruiter simulation");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse simulation response");
      }
      
      const result = JSON.parse(jsonMatch[0]);
      console.log("Recruiter simulation complete");

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid request type");

  } catch (error) {
    console.error("Error in analyze-linkedin function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
