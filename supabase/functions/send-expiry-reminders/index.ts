import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[EXPIRY-REMINDERS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for manual trigger with specific purchase_id
    let purchaseId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        purchaseId = body.purchase_id || null;
      } catch {
        // No body or invalid JSON, proceed with batch mode
      }
    }

    logStep("Starting expiry reminder", { mode: purchaseId ? "manual" : "batch", purchaseId });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let expiringPurchases: any[] = [];

    if (purchaseId) {
      // Manual mode: send reminder for specific purchase
      const { data, error: fetchError } = await supabaseAdmin
        .from("tool_purchases")
        .select("*")
        .eq("id", purchaseId)
        .eq("status", "active")
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch purchase: ${fetchError.message}`);
      }
      if (!data) {
        throw new Error("Purchase not found or not active");
      }
      expiringPurchases = [data];
    } else {
      // Batch mode: find purchases expiring in ~3 days
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

      const { data, error: fetchError } = await supabaseAdmin
        .from("tool_purchases")
        .select("*")
        .eq("status", "active")
        .is("reminder_sent_at", null)
        .gte("expires_at", twoDaysFromNow.toISOString())
        .lte("expires_at", fourDaysFromNow.toISOString());

      if (fetchError) {
        throw new Error(`Failed to fetch expiring purchases: ${fetchError.message}`);
      }
      expiringPurchases = data || [];
    }

    logStep("Found purchases to notify", { count: expiringPurchases.length });

    if (expiringPurchases.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No purchases to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const purchase of expiringPurchases) {
      try {
        const toolName = purchase.tool_type === "resume_suite" 
          ? "Resume Intelligence Suite" 
          : "LinkedIn Signal Score";
        
        const expiresAt = new Date(purchase.expires_at);
        const currentTime = new Date();
        const daysRemaining = Math.ceil((expiresAt.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
        const expiryDate = expiresAt.toLocaleDateString("en-US", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        });

        const baseUrl = "https://theleadersrow.com";

        // Send reminder email
        const { error: emailError } = await resend.emails.send({
          from: "Rimo AI <hello@theleadersrow.com>",
          to: [purchase.email],
          subject: `Your ${toolName} access expires in ${daysRemaining} days`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">⏰ Your Access Expires Soon</h1>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hi there,
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your <strong>${toolName}</strong> access will expire on <strong>${expiryDate}</strong> 
                (${daysRemaining} days from now).
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Don't lose access!</strong> Renew now to continue using the ${toolName} for resume optimization and career advancement.
                </p>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                With your access, you can continue to:
              </p>
              
              <ul style="font-size: 14px; color: #555; margin-bottom: 25px;">
                ${purchase.tool_type === "resume_suite" ? `
                  <li>Score your resume against any job description</li>
                  <li>Get AI-powered resume enhancements</li>
                  <li>Track before/after improvements</li>
                ` : `
                  <li>Score your LinkedIn profile like recruiters do</li>
                  <li>Get AI optimization suggestions</li>
                  <li>Improve your professional visibility</li>
                `}
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/career-coach" style="background-color: #d4a853; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Renew My Access →
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you have any questions, feel free to reach out at 
                <a href="mailto:theleadersrow@gmail.com" style="color: #d4a853;">theleadersrow@gmail.com</a>.
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
          errors.push(`Failed to send to ${purchase.email}: ${emailError.message}`);
          continue;
        }

        // Mark reminder as sent
        await supabaseAdmin
          .from("tool_purchases")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", purchase.id);

        sentCount++;
        logStep("Reminder sent", { email: purchase.email, toolType: purchase.tool_type });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error processing ${purchase.email}: ${errorMsg}`);
      }
    }

    logStep("Completed", { sent: sentCount, errors: errors.length });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${sentCount} reminder(s)`, 
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined 
      }),
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
