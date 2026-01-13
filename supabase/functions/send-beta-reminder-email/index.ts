import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  name: string;
  email: string;
  customMessage?: string;
  toolType?: string;
}

const getToolConfig = (toolType: string) => {
  switch (toolType) {
    case "linkedin_signal":
      return {
        name: "LinkedIn Signal Score",
        date: "Wednesday, January 15, 2026",
        color: "#0077b5",
        checklist: `
          <li>✅ Check your email for the Zoom link we sent earlier</li>
          <li>✅ Have your LinkedIn profile URL ready</li>
          <li>✅ Know the role(s) you're targeting</li>
          <li>✅ Set a calendar reminder 15 minutes before</li>
        `,
      };
    case "interview_prep":
      return {
        name: "Interview Prep",
        date: "Monday, January 19, 2026",
        color: "#10b981",
        checklist: `
          <li>✅ Check your email for the Zoom link we sent earlier</li>
          <li>✅ Know your target company and role level</li>
          <li>✅ Have 2-3 STAR stories ready to practice</li>
          <li>✅ Set a calendar reminder 15 minutes before</li>
        `,
      };
    case "advisor":
      return {
        name: "AI Personal Advisor",
        date: "TBD",
        color: "#8b5cf6",
        checklist: `
          <li>✅ Check your email for the Zoom link we sent earlier</li>
          <li>✅ Think about your current career challenges</li>
          <li>✅ Have specific questions or decisions you need guidance on</li>
          <li>✅ Set a calendar reminder 15 minutes before</li>
        `,
      };
    default: // resume_suite
      return {
        name: "Resume Intelligence Suite",
        date: "Wednesday, January 14, 2026",
        color: "#4f46e5",
        checklist: `
          <li>✅ Check your email for the Zoom link we sent earlier</li>
          <li>✅ Have your current resume ready (PDF or Word)</li>
          <li>✅ Know the role(s) you're targeting</li>
          <li>✅ Set a calendar reminder 15 minutes before</li>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, customMessage, toolType = "resume_suite" }: ReminderEmailRequest = await req.json();

    const config = getToolConfig(toolType);
    console.log(`Sending beta reminder for ${config.name} to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: `Reminder: ${config.name} Beta Testing Tomorrow!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⏰ Event Reminder</h1>
            <p style="color: #fef3c7; margin-top: 10px; font-size: 16px;">Don't miss the ${config.name} Beta!</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              This is a friendly reminder that our <strong>${config.name} Live Beta Testing</strong> session is coming up soon!
            </p>
            
            <div style="background: #fef3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color};">
              <p style="margin: 0 0 10px 0; font-weight: 600; font-size: 18px;">📅 Event Details</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${config.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> 6:00–7:30 PM Central (CT)</p>
              <p style="margin: 5px 0;"><strong>Format:</strong> Live Zoom Session</p>
            </div>
            
            ${customMessage ? `
            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Note from the team:</strong> ${customMessage}</p>
            </div>
            ` : ''}
            
            <h3 style="margin-top: 30px; margin-bottom: 15px;">Quick Checklist</h3>
            <ul style="font-size: 14px; padding-left: 20px;">
              ${config.checklist}
            </ul>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Can't find your Zoom link? Reply to this email and we'll resend it.
            </p>
            
            <p style="font-size: 16px; margin-top: 20px;">
              See you there!
            </p>
            
            <p style="font-size: 16px; margin-bottom: 0;">
              Best,<br>
              <strong>The Leader's Row Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
            <p>© 2026 The Leader's Row. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Beta reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending beta reminder email:", error);
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
