import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[SEND-TOOL-ACCESS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, toolType } = await req.json();
    logStep("Request received", { email, toolType });

    if (!email || !toolType) {
      throw new Error("Email and toolType are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Generate secure access token
    const accessToken = crypto.randomUUID() + "-" + crypto.randomUUID();
    logStep("Generated access token");

    // Find the most recent pending purchase for this email and tool
    const { data: purchase, error: findError } = await supabaseAdmin
      .from("tool_purchases")
      .select("*")
      .eq("email", email)
      .eq("tool_type", toolType)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (findError || !purchase) {
      logStep("No pending purchase found, creating new one", { findError });
      // Create a new active purchase record
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const { error: insertError } = await supabaseAdmin
        .from("tool_purchases")
        .insert({
          email,
          tool_type: toolType,
          status: "active",
          access_token: accessToken,
          expires_at: expiryDate.toISOString(),
          purchased_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Failed to create purchase: ${insertError.message}`);
      }
    } else {
      // Update existing pending purchase to active with token
      const { error: updateError } = await supabaseAdmin
        .from("tool_purchases")
        .update({
          status: "active",
          access_token: accessToken,
          purchased_at: new Date().toISOString(),
        })
        .eq("id", purchase.id);

      if (updateError) {
        throw new Error(`Failed to update purchase: ${updateError.message}`);
      }
      logStep("Updated purchase to active", { purchaseId: purchase.id });
    }

    // Determine tool name for email
    const toolName = toolType === "resume_suite" 
      ? "Resume Intelligence Suite" 
      : "LinkedIn Signal Score";

    const baseUrl = "https://theleadersrow.com";
    const accessLink = `${baseUrl}/career-coach?verify=${accessToken}&tool=${toolType}`;

    // Send access email
    const { error: emailError } = await resend.emails.send({
      from: "Rimo AI <hello@theleadersrow.com>",
      to: [email],
      subject: `Your ${toolName} Access is Ready`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">✨ Your Access is Ready</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for purchasing the <strong>${toolName}</strong>!
          </p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Click the button below to access your tool. This link works on any device and will grant you <strong>30 days of access</strong>.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${accessLink}" style="background-color: #d4a853; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              Access ${toolName} →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            <strong>Note:</strong> This access link is unique to you. You can use it to access the tool from any device during your 30-day access period.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            If you didn't make this purchase, please contact us at <a href="mailto:theleadersrow@gmail.com" style="color: #d4a853;">theleadersrow@gmail.com</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Rimo AI • The Leader's Row<br>
            <a href="${baseUrl}" style="color: #999;">theleadersrow.com</a>
          </p>
        </body>
        </html>
      `,
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep("Access email sent successfully", { email });

    return new Response(
      JSON.stringify({ success: true, message: "Access email sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
