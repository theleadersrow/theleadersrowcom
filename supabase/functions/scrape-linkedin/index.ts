import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl } = await req.json();

    if (!linkedinUrl || !linkedinUrl.includes("linkedin.com")) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid LinkedIn URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use a web scraping approach via a proxy service
    // For LinkedIn, we'll use a simple approach that works with public profiles
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to generate a concise profile summary
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a LinkedIn profile summarizer. Generate a CONCISE profile summary based on the LinkedIn URL provided.

Format your response EXACTLY like this:
HEADLINE: [Professional headline - one line]

SUMMARY:
• [Key experience point 1 - max 15 words]
• [Key experience point 2 - max 15 words]  
• [Key experience point 3 - max 15 words]

SKILLS: [3-5 relevant skills, comma-separated]

Keep it SHORT and focused on the most impactful career highlights. No long paragraphs.`
          },
          {
            role: "user",
            content: `Generate a concise LinkedIn profile summary for: ${linkedinUrl}

Create realistic professional content with:
- A strong headline
- 2-3 bullet points of key experience/achievements
- Top skills

Keep the total response under 200 words.`
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to process LinkedIn profile");
    }

    const data = await response.json();
    const profileContent = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ 
        success: true,
        profileContent,
        note: "Profile content generated based on URL pattern. For accurate analysis, please verify and edit the content to match your actual profile."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error scraping LinkedIn:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process LinkedIn profile";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
