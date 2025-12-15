import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return new Response(
        JSON.stringify({ error: "Resume text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (resumeText.length > 15000) {
      return new Response(
        JSON.stringify({ error: "Resume text is too long. Please limit to 15,000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Enhancing resume with AI...");

    const systemPrompt = `You are an expert resume writer and career coach specializing in Product Management and tech careers. Your task is to analyze and enhance resumes.

When given a resume, you must:
1. Analyze the current structure and content
2. Identify areas for improvement
3. Rewrite and enhance the content with:
   - Stronger action verbs (Led, Drove, Spearheaded, Orchestrated, etc.)
   - Quantified achievements (percentages, dollar amounts, team sizes)
   - Impact-focused bullet points (STAR format: Situation, Task, Action, Result)
   - Professional tone and consistent formatting
4. Recommend optimal section ordering
5. Suggest a professional color scheme
6. Recommend appropriate fonts

You MUST respond with a valid JSON object in exactly this format:
{
  "suggestions": [
    "Specific improvement made #1",
    "Specific improvement made #2",
    "Specific improvement made #3",
    "Specific improvement made #4",
    "Specific improvement made #5"
  ],
  "enhancedContent": "The full enhanced resume content in markdown format with proper headings (## for sections), bullet points, and formatting",
  "formatting": {
    "sections": ["Section1", "Section2", "Section3", "Section4", "Section5"],
    "colorScheme": "Recommended color palette description (e.g., 'Navy blue (#1E3A5F) for headers with charcoal (#333333) for body text')",
    "fontRecommendation": "Font pairing recommendation (e.g., 'Calibri for body text, Cambria for headers')"
  }
}

Make the enhanced content significantly better than the original with:
- Clear section headers
- Consistent bullet point formatting
- Professional language throughout
- Quantified achievements where possible
- Action-oriented language`;

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
          { role: "user", content: `Please enhance this resume:\n\n${resumeText}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate enhanced resume" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, parsing...");

    // Try to parse the JSON response
    let result;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Raw content:", content.substring(0, 500));
      
      // Fallback: create a structured response from raw content
      result = {
        suggestions: [
          "Enhanced professional language and tone",
          "Added stronger action verbs throughout",
          "Improved bullet point structure",
          "Optimized section organization",
          "Enhanced readability and formatting"
        ],
        enhancedContent: content,
        formatting: {
          sections: ["Contact", "Summary", "Experience", "Education", "Skills"],
          colorScheme: "Navy blue (#1E3A5F) for headers with charcoal (#333333) for body text",
          fontRecommendation: "Calibri for body text, Cambria for headers"
        }
      };
    }

    console.log("Resume enhancement complete");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in enhance-resume function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});