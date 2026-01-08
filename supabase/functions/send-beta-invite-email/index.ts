import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  name: string;
  email: string;
  zoomLink: string;
  customMessage?: string;
  toolType?: string;
}

const getToolConfig = (toolType: string) => {
  switch (toolType) {
    case "linkedin_signal":
      return {
        name: "LinkedIn Signal Score",
        emoji: "🔗",
        color: "#0077b5",
        gradientEnd: "#005582",
        date: "Wednesday, January 7, 2026",
        prepareInstructions: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Have your LinkedIn profile URL ready</li>
            <li>Know the role(s) you're targeting</li>
            <li>Come with questions about LinkedIn optimization</li>
          </ul>
        `,
        sessionDetails: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Walk through the LinkedIn Signal Score experience</li>
            <li>Analyze your profile's visibility and impact</li>
            <li>Identify gaps in headline, summary, and experience sections</li>
            <li>Get a prioritized improvement checklist</li>
            <li>Share feedback to help us improve</li>
          </ul>
        `,
      };
    case "interview_prep":
      return {
        name: "Interview Prep",
        emoji: "🎤",
        color: "#10b981",
        gradientEnd: "#059669",
        date: "Friday, January 9, 2026",
        prepareInstructions: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Know your target company and role level</li>
            <li>Have 2-3 STAR stories ready to practice</li>
            <li>Come with questions about interview techniques</li>
          </ul>
        `,
        sessionDetails: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Walk through the Interview Prep tool experience</li>
            <li>Practice company-specific mock interview questions</li>
            <li>Get real-time AI feedback on your answers</li>
            <li>Identify areas for improvement</li>
            <li>Share feedback to help us improve</li>
          </ul>
        `,
      };
    case "advisor":
      return {
        name: "AI Personal Advisor",
        emoji: "🤖",
        color: "#8b5cf6",
        gradientEnd: "#7c3aed",
        date: "TBD",
        prepareInstructions: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Think about your current career challenges</li>
            <li>Have specific questions or decisions you need guidance on</li>
            <li>Come ready to explore goal-setting features</li>
          </ul>
        `,
        sessionDetails: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Walk through the AI Advisor experience</li>
            <li>Get personalized career guidance</li>
            <li>Explore goal tracking and accountability features</li>
            <li>Share feedback to help us improve</li>
          </ul>
        `,
      };
    default: // resume_suite
      return {
        name: "Resume Intelligence Suite",
        emoji: "📄",
        color: "#4f46e5",
        gradientEnd: "#7c3aed",
        date: "Wednesday, January 14, 2026",
        prepareInstructions: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Have your current resume ready (PDF or Word)</li>
            <li>Know the role(s) you're targeting</li>
            <li>Come with questions about resume optimization</li>
          </ul>
        `,
        sessionDetails: `
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>Walk through the Resume Intelligence experience with guided prompts</li>
            <li>Identify gaps in your resume (impact, keywords, role-fit)</li>
            <li>Get a prioritized improvement checklist</li>
            <li>Share feedback to help us improve</li>
          </ul>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, zoomLink, customMessage, toolType }: InviteEmailRequest = await req.json();

    console.log(`Sending beta invite to ${email} for tool: ${toolType || 'resume_suite'}`);

    const config = getToolConfig(toolType || "resume_suite");

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: `You're Invited! ${config.name} Beta Testing - ${config.date.split(',')[1]?.trim() || config.date}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 You're Invited!</h1>
            <p style="color: #e0e0e0; margin-top: 10px; font-size: 16px;">${config.emoji} ${config.name} Beta Testing</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! You've been selected to participate in our <strong>${config.name} Live Beta Testing</strong> session.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color};">
              <p style="margin: 0 0 10px 0; font-weight: 600; font-size: 18px;">Event Details</p>
              <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${config.date}</p>
              <p style="margin: 5px 0;">🕕 <strong>Time:</strong> 6:00–7:30 PM Central (CT)</p>
              <p style="margin: 5px 0;">💻 <strong>Format:</strong> Live Zoom Session</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${zoomLink}" style="background: linear-gradient(135deg, ${config.color} 0%, ${config.gradientEnd} 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                🎥 Join Zoom Meeting
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              <strong>Zoom Link:</strong> <a href="${zoomLink}" style="color: ${config.color};">${zoomLink}</a>
            </p>
            
            ${customMessage ? `
            <div style="background: #fef3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">${customMessage}</p>
            </div>
            ` : ''}
            
            <h3 style="margin-top: 30px; margin-bottom: 15px;">What to Prepare</h3>
            ${config.prepareInstructions}
            
            <h3 style="margin-top: 30px; margin-bottom: 15px;">During the Session</h3>
            ${config.sessionDetails}
            
            <p style="font-size: 16px; margin-top: 30px;">
              We're excited to have you join us!
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

    console.log("Beta invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending beta invite email:", error);
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
