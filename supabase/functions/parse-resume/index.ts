import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    let file: File | null = null;
    let sessionId: string | null = null;
    let fileBase64: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    // Handle both FormData and JSON requests
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      file = formData.get('file') as File;
      sessionId = formData.get('sessionId') as string;
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      fileBase64 = json.fileBase64;
      fileName = json.fileName;
      fileType = json.fileType;
      sessionId = json.sessionId;
    }

    // Validate we have file data
    if (!file && !fileBase64) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let base64Content: string;
    let mimeType: string;

    if (file) {
      // Read file content from FormData upload
      const arrayBuffer = await file.arrayBuffer();
      base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      mimeType = file.type;
    } else {
      // Use base64 from JSON body
      base64Content = fileBase64!;
      mimeType = fileType || 'application/pdf';
    }

    console.log("Parsing resume with AI, file type:", mimeType);

    // Use AI to parse the resume content
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
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract and return the full text content from this resume document. Preserve the structure and formatting as much as possible. Include all sections like contact info, work experience, education, skills, etc. Return only the extracted text, nothing else."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Content}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI parsing error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: "Failed to parse resume",
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const resumeText = aiResponse.choices?.[0]?.message?.content || "";

    console.log("Resume parsed successfully, extracted", resumeText.length, "characters");

    // If sessionId provided, save to database
    if (sessionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Upload file to storage if we have the original file
      let resumeUrl = null;
      if (file) {
        const storagePath = `${sessionId}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: true
          });

        if (!uploadError && uploadData) {
          resumeUrl = uploadData.path;
        }
      }

      // Update the assessment record
      const { error: updateError } = await supabase
        .from('career_assessments')
        .update({
          resume_url: resumeUrl,
          resume_text: resumeText
        })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error("Database update error:", updateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      resumeText,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Parse resume error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});