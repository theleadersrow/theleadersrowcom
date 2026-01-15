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

    // Save registration to database
    const { error: dbError } = await supabase
      .from("webinar_registrations")
      .insert({
        full_name: name,
        email: email,
        webinar_title: "The 200K Method",
        webinar_date: "2025-01-15T19:30:00-06:00",
        status: "registered",
        confirmation_sent: true,
      });

    if (dbError) {
      console.error("Error saving registration:", dbError);
      // Continue to send email even if DB save fails
    }

    console.log(`Sending webinar confirmation to ${email}`);

    // Send confirmation email to registrant
    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <onboarding@resend.dev>",
      to: [email],
      subject: "You're Registered: The 200K Method Webinar",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: 600;">You're Registered! 🎉</h1>
              <p style="color: #f5f5f0; margin: 10px 0 0 0; font-size: 16px;">The 200K Method Webinar</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${name},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">Thank you for registering for <strong>The 200K Method</strong> webinar! We're excited to have you join us.</p>
              
               <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
                 <h3 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 18px;">📅 Event Details</h3>
                 <p style="margin: 0 0 8px 0;"><strong>Date:</strong> Thursday, January 15th, 2025</p>
                 <p style="margin: 0 0 8px 0;"><strong>Time:</strong> 7:30 PM Central (1 hour)</p>
                 <p style="margin: 0;"><strong>Where:</strong> Zoom (link below)</p>
               </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ZOOM_LINK}" style="display: inline-block; background-color: #d4af37; color: #1a1a2e; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Join Zoom Webinar</a>
              </div>
              
              <div style="background-color: #fffbeb; border-left: 4px solid #d4af37; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>📌 Save this link:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; word-break: break-all;">${ZOOM_LINK}</p>
              </div>
              
              <h3 style="margin: 24px 0 16px 0; color: #1a1a2e; font-size: 18px;">What You'll Learn:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">The exact framework used to land $200K+ offers</li>
                <li style="margin-bottom: 8px;">How to position yourself for senior roles</li>
                <li style="margin-bottom: 8px;">Negotiation strategies that maximize compensation</li>
                <li style="margin-bottom: 8px;">Live Q&A with real examples</li>
              </ul>
              
              <p style="margin: 24px 0 0 0; font-size: 16px;">See you there!</p>
              <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>The Leader's Row Team</strong></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p style="margin: 0;">Questions? Reply to this email or contact us at theleadersrow@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Also send notification to admin
    await resend.emails.send({
      from: "The Leader's Row <onboarding@resend.dev>",
      to: ["theleadersrow@gmail.com"],
      subject: `New Webinar Registration: ${name}`,
       html: `
         <h2>New Webinar Registration</h2>
         <p><strong>Name:</strong> ${name}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Event:</strong> The 200K Method Webinar</p>
         <p><strong>Date:</strong> Thursday, January 15th, 2025 at 7:30 PM Central</p>
       `,
     });

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
