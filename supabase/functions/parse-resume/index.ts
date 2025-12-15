import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMinutes: 60,
};

// Check and update rate limit
async function checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000).toISOString();
  
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart)
    .single();

  if (existing) {
    if (existing.request_count >= RATE_LIMIT.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
    
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.request_count - 1 };
  }
  
  await supabase
    .from("rate_limits")
    .upsert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    }, { onConflict: "identifier,endpoint" });
  
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "parse-resume");
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(RATE_LIMIT.windowMinutes * 60),
            ...corsHeaders 
          },
        }
      );
    }
    
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
      
      // Validate file
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          return new Response(JSON.stringify({ error: "File too large. Maximum size is 5MB." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return new Response(JSON.stringify({ error: "Invalid file type. Please upload a PDF or Word document." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      fileBase64 = json.fileBase64;
      fileName = json.fileName;
      fileType = json.fileType;
      sessionId = json.sessionId;
      
      // Validate base64 size (rough estimate)
      if (fileBase64 && fileBase64.length > MAX_FILE_SIZE * 1.4) { // base64 is ~1.37x larger
        return new Response(JSON.stringify({ error: "File too large. Maximum size is 5MB." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (fileType && !ALLOWED_MIME_TYPES.includes(fileType)) {
        return new Response(JSON.stringify({ error: "Invalid file type. Please upload a PDF or Word document." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    // Helper function to convert array buffer to base64 without stack overflow
    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192; // Process in chunks to avoid stack overflow
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      return btoa(binary);
    }

    if (file) {
      // Read file content from FormData upload
      const arrayBuffer = await file.arrayBuffer();
      base64Content = arrayBufferToBase64(arrayBuffer);
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
      text: resumeText,
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