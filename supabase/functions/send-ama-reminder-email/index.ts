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
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔔</div>
            <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Event Reminder</h1>
            <p style="color: #6b7280; margin-top: 5px;">Your AMA Session is Coming Up!</p>
          </div>
          
          <p style="font-size: 16px;">Hi ${name},</p>
          
          <p style="font-size: 16px;">This is a friendly reminder about the upcoming <strong>Monthly Career Acceleration AMA</strong> session!</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; color: white; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 20px;">📅 Event Details</h2>
            <p style="margin: 5px 0; font-size: 18px;"><strong>${eventDateDisplay}</strong></p>
          </div>
          
          ${customMessage ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">${customMessage}</p>
          </div>
          ` : ''}
          
          ${zoomLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${zoomLinkDisplay}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Join Zoom Meeting</a>
          </div>
          ` : ''}
          
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 16px;">💡 Quick Reminders:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #15803d;">
              <li style="margin-bottom: 8px;">Join 5 minutes early to test your audio/video</li>
              <li style="margin-bottom: 8px;">Have your questions ready</li>
              <li style="margin-bottom: 8px;">Bring a notepad to capture insights</li>
              <li>Engage with other attendees' questions for bonus value</li>
            </ul>
          </div>
          
          <p style="font-size: 16px;">We're excited to see you there!</p>
          
          <p style="margin-top: 30px; font-size: 16px;">
            Best regards,<br>
            <strong>The RIMO Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #6b7280;">
            You're receiving this because you registered for the RIMO Monthly AMA.<br>
            <a href="mailto:support@rimocareers.com" style="color: #6b7280;">Contact Support</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "RIMO <events@rimocareers.com>",
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
