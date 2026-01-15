import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebinarEmailRequest {
  to: string;
  name: string;
  subject: string;
  body: string;
  zoomLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, subject, body, zoomLink }: WebinarEmailRequest = await req.json();

    if (!to || !name || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending webinar email to ${to}`);

    // Convert plain text body to HTML
    const htmlBody = body
      .replace(/\n/g, "<br>")
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color: #d4af37;">$1</a>');

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">The 200K Method</h1>
              <p style="color: #f5f5f0; margin: 10px 0 0 0; font-size: 14px;">Your path to a $200K+ career</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 15px; line-height: 1.7;">
                ${htmlBody}
              </div>
              
              ${zoomLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${zoomLink}" style="display: inline-block; background-color: #d4af37; color: #1a1a2e; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Join Zoom Webinar</a>
              </div>
              ` : ""}
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

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-webinar-email:", error);
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
