import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const resend = new Resend(resendKey);

    const { enrollmentId } = await req.json();
    logStep("Request received", { enrollmentId });

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get enrollment with program details
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("enrollments")
      .select(`
        *,
        programs (name)
      `)
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentError?.message}`);
    }

    logStep("Enrollment found", { 
      email: enrollment.email, 
      code: enrollment.enrollment_code,
      program: enrollment.programs?.name 
    });

    const firstName = enrollment.first_name || "there";
    const productName = enrollment.programs?.name || "200K Method";
    const signupLink = "https://theleadersrow.com/signup";

    // Send confirmation email with enrollment code and signup link
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1f2e 0%, #2d3548 100%); color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; color: #d4a853; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .highlight-box { background: #f8f9fa; border-left: 4px solid #d4a853; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .code-box { background: #1a1f2e; color: #d4a853; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .code-box .code { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
          .cta-button { display: inline-block; background: #d4a853; color: #1a1f2e !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .step { display: flex; align-items: flex-start; margin: 15px 0; }
          .step-number { background: #d4a853; color: #1a1f2e; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">You're now enrolled in ${productName}</p>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            
            <p>Welcome to <strong>The Leader's Row</strong>! Your payment has been successfully processed and you're now officially enrolled in <strong>${productName}</strong>.</p>
            
            <div class="code-box">
              <p style="margin: 0; font-size: 14px; color: #888;">YOUR ENROLLMENT CODE</p>
              <p class="code">${enrollment.enrollment_code}</p>
              <p style="margin: 0; font-size: 12px; color: #888;">Keep this code safe - you'll need it to create your account</p>
            </div>
            
            <div class="highlight-box">
              <h3 style="margin-top: 0; color: #1a1f2e;">📋 Create Your Member Account</h3>
              <p style="margin-bottom: 15px;">Follow these simple steps to access your member portal:</p>
              
              <div class="step">
                <span class="step-number">1</span>
                <span>Click the button below to go to the member signup page</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span>Enter your enrollment code: <strong>${enrollment.enrollment_code}</strong></span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span>Create your account with your email and password</span>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <span>Access your dashboard, resources, and program content</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${signupLink}" class="cta-button">Create Your Member Account →</a>
            </div>
            
            <div class="highlight-box" style="background: #fff9e6;">
              <h3 style="margin-top: 0; color: #1a1f2e;">🚀 What's Included</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Access to your member dashboard with all program content</li>
                <li>Zoom links for live sessions</li>
                <li>Downloadable resources and worksheets</li>
                <li>Access to our private community</li>
              </ul>
            </div>
            
            <p>If you have any questions, don't hesitate to reach out to us at <a href="mailto:theleadersrow@gmail.com">theleadersrow@gmail.com</a>.</p>
            
            <p>We're thrilled to have you on this journey to becoming a top-tier leader!</p>
            
            <p>Best regards,<br><strong>The Leader's Row Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Leader's Row. All rights reserved.</p>
            <p><a href="https://theleadersrow.com" style="color: #d4a853;">theleadersrow.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [enrollment.email],
      subject: `🎉 Congratulations! You're enrolled in ${productName}`,
      html: emailHtml,
    });

    logStep("Email sent", { response: emailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      sentTo: enrollment.email 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
