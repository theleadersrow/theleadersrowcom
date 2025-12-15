import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnhancedResumeRequest {
  email: string;
  resumeContent: string;
  improvements: {
    keywordsAdded: number;
    achievementsQuantified: number;
    actionVerbsUpgraded: number;
  };
  scores: {
    before: number;
    after: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resumeContent, improvements, scores }: EnhancedResumeRequest = await req.json();

    if (!email || !resumeContent) {
      return new Response(
        JSON.stringify({ error: "Email and resume content are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const scoreImprovement = scores.after - scores.before;

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: "Your AI-Enhanced Resume is Ready",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #111827; font-size: 24px; margin: 0 0 8px 0;">Your Enhanced Resume</h1>
                <p style="color: #6b7280; margin: 0;">Optimized by Rimo AI Career Coach</p>
              </div>

              <!-- Score Card -->
              <div style="background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <div style="color: white; font-size: 14px; margin-bottom: 8px;">ATS Score Improvement</div>
                <div style="display: flex; justify-content: center; align-items: center; gap: 16px;">
                  <span style="color: rgba(255,255,255,0.8); font-size: 24px;">${scores.before}</span>
                  <span style="color: white; font-size: 18px;">→</span>
                  <span style="color: white; font-size: 36px; font-weight: bold;">${scores.after}</span>
                </div>
                <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 8px;">+${scoreImprovement} points improvement</div>
              </div>

              <!-- Improvements -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">What We Improved:</h3>
                <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Added ${improvements.keywordsAdded} missing keywords from the job description</li>
                  <li>Quantified ${improvements.achievementsQuantified} achievements with metrics</li>
                  <li>Upgraded ${improvements.actionVerbsUpgraded} action verbs for stronger impact</li>
                </ul>
              </div>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <!-- Resume Content -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px 0;">Your Enhanced Resume:</h3>
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; font-size: 13px; line-height: 1.6; color: #374151; white-space: pre-wrap; font-family: 'Courier New', monospace;">
${resumeContent}
                </div>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-top: 32px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">Ready to accelerate your career even further?</p>
                <a href="https://theleadersrow.com/entry-to-faang" style="display: inline-block; background-color: #c9a227; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Explore Our Programs</a>
              </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} The Leader's Row. All rights reserved.</p>
              <p style="margin: 8px 0 0 0;">
                <a href="https://theleadersrow.com" style="color: #6b7280;">theleadersrow.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Enhanced resume email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending enhanced resume email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
