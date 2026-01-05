import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  name: string;
  email: string;
  eventDateTime?: string;
  zoomLink?: string;
  customMessage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, eventDateTime, zoomLink, customMessage }: ReminderEmailRequest = await req.json();

    console.log(`Sending AMA reminder email to ${email}`);

    const eventDateDisplay = eventDateTime || "Tomorrow";
    const zoomLinkDisplay = zoomLink || "#";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3548 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #d4a853; margin: 0; font-size: 28px;">🔔 Event Reminder</h1>
          <p style="color: #e0e0e0; margin-top: 10px; font-size: 18px;">Your AMA Session is Coming Up!</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name.split(' ')[0] || name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            This is a friendly reminder about the upcoming <strong>Monthly AMA: Career Acceleration</strong> session!
          </p>
          
          <div style="background: #1a1f2e; color: #fff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #d4a853; margin: 0 0 15px 0; font-size: 18px;">📅 Event Details</h3>
            <p style="margin: 8px 0; font-size: 18px;"><strong>${eventDateDisplay}</strong></p>
          </div>
          
          ${customMessage ? `
          <div style="background: #f8f9fa; border-left: 4px solid #d4a853; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #333;">${customMessage}</p>
          </div>
          ` : ''}
          
          ${zoomLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${zoomLinkDisplay}" style="background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%); color: #1a1f2e; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px;">
              🎥 Join Zoom Meeting
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 25px; text-align: center;">
            <strong>Zoom Link:</strong> <a href="${zoomLinkDisplay}" style="color: #d4a853;">${zoomLinkDisplay}</a>
          </p>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1a1f2e; font-size: 16px;">💡 Quick Reminders</h3>
            <ul style="font-size: 14px; padding-left: 20px; margin: 0; color: #555;">
              <li style="margin-bottom: 8px;">Join a few minutes early to get settled</li>
              <li style="margin-bottom: 8px;">Have your questions ready</li>
              <li style="margin-bottom: 8px;">Use the chat or raise hand feature to ask questions</li>
              <li style="margin-bottom: 8px;">Take notes on insights that resonate with you</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; margin-top: 30px;">
            We're excited to see you there!
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
    `;

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: "🔔 Reminder: Your AMA Session is Coming Up!",
      html: emailHtml,
    });

    console.log("AMA reminder email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending AMA reminder email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
