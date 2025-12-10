import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BlueprintEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-blueprint-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: BlueprintEmailRequest = await req.json();
    
    console.log("Sending blueprint teaser email to:", email);

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: "Your 200K Method Quick Start Guide is Here!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">The Leader's Row</h1>
          </div>
          
          <div style="background: #fff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="color: #1a2332; margin-top: 0;">Your Quick Start Guide is Ready!</h2>
            
            <p>Thanks for downloading the <strong>200K Method Quick Start Guide</strong> — here's a preview of what separates $200K+ Product Leaders from everyone else.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a2332; margin-top: 0; font-size: 18px;">🎯 The 3 Career Accelerators</h3>
              
              <p><strong>1. Strategic Positioning</strong><br>
              Most PMs focus on doing great work. Top earners focus on being <em>known</em> for great work. Your personal brand isn't vanity — it's leverage.</p>
              
              <p><strong>2. Interview Mastery</strong><br>
              The difference between a $150K and $200K+ offer often comes down to <em>how</em> you communicate your value, not <em>what</em> you've done.</p>
              
              <p><strong>3. Executive Presence</strong><br>
              Senior leaders don't just have skills — they have <em>presence</em>. The way you speak, present, and influence determines your ceiling.</p>
            </div>
            
            <p style="font-style: italic; color: #666;">This is just the beginning. The full 200K Method program dives deep into 8 comprehensive modules with live coaching, hands-on workshops, and personalized feedback.</p>
            
            <div style="background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #D4AF37; font-weight: 600; font-size: 14px;">READY TO GO DEEPER?</p>
              <p style="margin: 0 0 15px 0; color: #fff; font-size: 18px;">Join the next 200K Method cohort</p>
              <a href="https://theleadersrow.com/200k-method" style="display: inline-block; background: #D4AF37; color: #1a2332; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Learn More →</a>
            </div>
            
            <p>Questions? Reply to this email or reach out at <a href="mailto:theleadersrow@gmail.com" style="color: #D4AF37;">theleadersrow@gmail.com</a></p>
            
            <p style="margin-top: 30px;">To your success,<br><strong>The Leader's Row Team</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} The Leader's Row. All rights reserved.</p>
            <p><a href="https://theleadersrow.com" style="color: #D4AF37;">theleadersrow.com</a></p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-blueprint-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);