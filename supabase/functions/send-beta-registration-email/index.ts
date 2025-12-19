import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BetaRegistrationRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: BetaRegistrationRequest = await req.json();

    // Send confirmation email to applicant
    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <onboarding@resend.dev>",
      to: [email],
      subject: "Application Received: Resume Intelligence Suite Beta Testing",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Application Received!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for applying to participate in the <strong>Resume Intelligence Suite Live Beta Testing</strong> session!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: 600;">Event Details:</p>
              <p style="margin: 5px 0;">📅 <strong>Date:</strong> Tuesday, January 6, 2026</p>
              <p style="margin: 5px 0;">🕕 <strong>Time:</strong> 6:00–8:00 PM Central (CT)</p>
              <p style="margin: 5px 0;">👥 <strong>Spots:</strong> 20 invited beta users</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Because spots are limited to 20 participants, invitations will be sent based on fit and response order.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>If selected</strong>, you'll receive a follow-up email with:
            </p>
            <ul style="font-size: 16px; margin-bottom: 20px;">
              <li>Calendar invite</li>
              <li>Zoom link</li>
              <li>Pre-session instructions</li>
            </ul>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We'll be in touch soon!
            </p>
            
            <p style="font-size: 16px; margin-bottom: 0;">
              Best,<br>
              <strong>The Leader's Row Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© 2025 The Leader's Row. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification to admin
    await resend.emails.send({
      from: "The Leader's Row <onboarding@resend.dev>",
      to: ["theleadersrow@gmail.com"],
      subject: `New Beta Registration: ${name}`,
      html: `
        <h2>New Beta Event Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>View all registrations in the admin dashboard.</p>
      `,
    });

    console.log("Beta registration emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending beta registration email:", error);
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
