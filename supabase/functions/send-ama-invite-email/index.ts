import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AMAInviteRequest {
  name: string;
  email: string;
  zoomLink: string;
  eventDateTime: string;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, zoomLink, eventDateTime, customMessage }: AMAInviteRequest = await req.json();

    console.log(`Sending AMA invite to ${email} for event: ${eventDateTime}`);

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: `🎤 You're Invited! Monthly AMA: Career Acceleration - ${eventDateTime}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3548 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #d4a853; margin: 0; font-size: 28px;">🎤 You're Invited!</h1>
            <p style="color: #e0e0e0; margin-top: 10px; font-size: 18px;">Monthly AMA: Career Acceleration</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name.split(' ')[0] || name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for registering for our <strong>Monthly AMA (Ask Me Anything): Career Acceleration</strong> session! Here are your event details:
            </p>
            
            <div style="background: #1a1f2e; color: #fff; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #d4a853; margin: 0 0 15px 0; font-size: 18px;">📅 Event Details</h3>
              <p style="margin: 8px 0; font-size: 15px;">🗓️ <strong>Date & Time:</strong> ${eventDateTime}</p>
              <p style="margin: 8px 0; font-size: 15px;">💻 <strong>Format:</strong> Live Zoom Q&A Session</p>
              <p style="margin: 8px 0; font-size: 15px;">⏱️ <strong>Duration:</strong> 2 hours</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${zoomLink}" style="background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%); color: #1a1f2e; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px;">
                🎥 Join Zoom Meeting
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 25px; text-align: center;">
              <strong>Zoom Link:</strong> <a href="${zoomLink}" style="color: #d4a853;">${zoomLink}</a>
            </p>
            
            ${customMessage ? `
            <div style="background: #f8f9fa; border-left: 4px solid #d4a853; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
              <p style="margin: 0; font-size: 14px; color: #333;">${customMessage}</p>
            </div>
            ` : ''}
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1a1f2e; font-size: 16px;">📝 What to Expect</h3>
              <ul style="font-size: 14px; padding-left: 20px; margin: 0; color: #555;">
                <li style="margin-bottom: 8px;">Live, unscripted Q&A with career experts</li>
                <li style="margin-bottom: 8px;">Direct answers to your career questions</li>
                <li style="margin-bottom: 8px;">Topics: leveling up, negotiating offers, career transitions, executive presence</li>
                <li style="margin-bottom: 8px;">Hear from peers facing similar challenges</li>
              </ul>
            </div>
            
            <div style="background: #fff9e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1a1f2e; font-size: 16px;">💡 Tips for the Session</h3>
              <ul style="font-size: 14px; padding-left: 20px; margin: 0; color: #555;">
                <li style="margin-bottom: 8px;">Join a few minutes early to get settled</li>
                <li style="margin-bottom: 8px;">Have your questions ready (or think of new ones during the session!)</li>
                <li style="margin-bottom: 8px;">Use the chat or raise hand feature to ask questions</li>
                <li style="margin-bottom: 8px;">Take notes on insights that resonate with you</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">
              We're excited to have you join us for this interactive session!
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Questions? Reply to this email or reach out to us at <a href="mailto:theleadersrow@gmail.com" style="color: #d4a853;">theleadersrow@gmail.com</a>
            </p>
            
            <p style="font-size: 16px; margin-top: 25px; margin-bottom: 0;">
              See you there!<br><br>
              <strong>The Leader's Row Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p style="margin: 5px 0;">© 2026 The Leader's Row. All rights reserved.</p>
            <p style="margin: 5px 0;"><a href="https://theleadersrow.com" style="color: #d4a853;">theleadersrow.com</a></p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("AMA invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending AMA invite email:", error);
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
