import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  name: string;
  email: string;
  toolType: string;
  eventDate: string;
  zoomLink: string | null;
  message: string;
  subject: string;
}

const getToolName = (toolType: string): string => {
  switch (toolType) {
    case "resume_suite":
      return "Resume Intelligence Suite";
    case "linkedin_signal":
      return "LinkedIn Signal Score";
    case "interview_prep":
      return "PM Interview Prep";
    default:
      return "Career Tool";
  }
};

const formatEventDate = (dateStr: string): string => {
  if (!dateStr) return "TBD";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return dateStr;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, toolType, eventDate, zoomLink, message, subject }: BulkEmailRequest = await req.json();

    console.log(`Sending bulk email to: ${email}`);

    const toolName = getToolName(toolType);
    const formattedDate = formatEventDate(eventDate);
    const hasZoomLink = zoomLink && zoomLink.trim() !== "";

    // Build session details section only if there's a zoom link
    const sessionDetailsSection = hasZoomLink ? `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 16px;">📅 Session Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Tool:</strong> ${toolName}</p>
        <p style="margin: 0 0 8px 0;"><strong>When:</strong> ${formattedDate}</p>
        <p style="margin: 0;"><strong>Where:</strong> Zoom (link below)</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${zoomLink}" style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #1a1a2e; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          Join Zoom Session
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        <strong>Zoom Link:</strong> <a href="${zoomLink}" style="color: #1a1a2e;">${zoomLink}</a>
      </p>
    ` : "";

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: subject || `🎉 You're Invited: ${toolName} Beta Testing Session`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">🚀 ${hasZoomLink ? "Beta Testing Session" : "Update from The Leader's Row"}</h1>
              <p style="color: #d4af37; margin: 10px 0 0; font-size: 16px;">${toolName}</p>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
              <p style="margin-top: 0; font-size: 18px;">Hi ${name},</p>
              
              <div style="white-space: pre-wrap; margin: 20px 0;">${message}</div>
              
              ${sessionDetailsSection}
              
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                See you soon!<br>
                <strong>The Leader's Row Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px; background: #fafafa;">
              <p style="margin: 0;">© ${new Date().getFullYear()} The Leader's Row. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Bulk email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-beta-bulk-email function:", error);
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
