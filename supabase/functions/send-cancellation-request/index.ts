import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CANCELLATION-REQUEST] ${step}${detailsStr}`);
};

interface CancellationRequest {
  fullName: string;
  email: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { fullName, email, reason }: CancellationRequest = await req.json();
    logStep("Request parsed", { fullName, email });

    // Validate input
    if (!fullName || !email) {
      throw new Error("Name and email are required");
    }

    const cancellationDate = new Date().toISOString();
    logStep("Cancellation date recorded", { cancellationDate });

    // Initialize Supabase client with service role to update enrollment
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Try to find and update the enrollment with cancellation date
    const { data: enrollment, error: updateError } = await supabaseClient
      .from("enrollments")
      .update({ 
        cancellation_requested_at: cancellationDate,
      })
      .eq("email", email)
      .eq("subscription_type", "subscription")
      .select()
      .maybeSingle();

    if (updateError) {
      logStep("Error updating enrollment", { error: updateError.message });
    } else if (enrollment) {
      logStep("Enrollment updated with cancellation date", { enrollmentId: enrollment.id });
    } else {
      logStep("No matching enrollment found - will still send notification");
    }

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: [email],
      subject: "Weekly Edge Cancellation Request Received",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 10px;">Cancellation Request Received</h1>
          </div>
          
          <p>Hi ${fullName},</p>
          
          <p>We've received your request to cancel your Weekly Edge membership.</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>What happens next:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your membership will remain active until the end of your current billing cycle</li>
              <li>You will <strong>not be charged</strong> for the next billing period</li>
              <li>You'll continue to have full access until your membership ends</li>
            </ul>
          </div>
          
          <p>If you have any questions or if you've changed your mind, please don't hesitate to reach out to us at <a href="mailto:connect@theleadersrow.com" style="color: #c9a227;">connect@theleadersrow.com</a>.</p>
          
          <p>Thank you for being part of Weekly Edge. We hope to see you again in the future!</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The Leader's Row Team</strong></p>
        </body>
        </html>
      `,
    });

    logStep("Customer confirmation email sent");

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      to: ["theleadersrow@gmail.com"],
      subject: `[ACTION REQUIRED] Weekly Edge Cancellation Request - ${fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc3545; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">⚠️ Cancellation Request Received</h1>
          </div>
          
          <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Member Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Request Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(cancellationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Reason:</td>
                <td style="padding: 8px 0;">${reason || "No reason provided"}</td>
              </tr>
            </table>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; font-weight: bold;">🔔 Action Required:</p>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Cancel the subscription in Stripe</li>
                <li>Update the cancellation effective date in the admin portal</li>
                <li>Confirm cancellation with the member if needed</li>
              </ol>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Admin notification email sent");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cancellation request processed",
        cancellationDate 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    logStep("ERROR in send-cancellation-request", { message: error.message });
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