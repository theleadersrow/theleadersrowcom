import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebinarRegistrationRequest {
  name: string;
  email: string;
}

const ZOOM_LINK = "https://zoom.us/j/97216217059?pwd=OMqa5Bi6L4BBeoDfnO9tCdGK6AAShn.1";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client with service role
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { name, email }: WebinarRegistrationRequest = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing webinar registration for ${email}`);

    // Save registration to database with pending status (no auto-email)
    const { error: dbError } = await supabase
      .from("webinar_registrations")
      .insert({
        full_name: name,
        email: email,
        webinar_title: "The 200K Method",
        webinar_date: "2026-01-15T19:30:00-06:00",
        status: "pending",
        confirmation_sent: false,
      });

    if (dbError) {
      console.error("Error saving registration:", dbError);
      throw new Error("Failed to save registration");
    }

    console.log(`Registration saved for ${email} with pending status`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-webinar-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
