import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADVISOR-EXPIRY-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");
    
    logStep("API keys verified");

    const { email, daysUntilExpiry } = await req.json();
    
    if (!email) throw new Error("Email is required");
    logStep("Request body parsed", { email, daysUntilExpiry });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = new Resend(resendKey);

    // Find customer and their subscription
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No customer found for this email");
    }

    const customerId = customers.data[0].id;
    const customerName = customers.data[0].name || email.split('@')[0];
    logStep("Found customer", { customerId, customerName });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Find Career Advisor subscription
    const CAREER_ADVISOR_PRODUCT_ID = "prod_TeCZHGXYMzyJNv";
    let advisorSubscription = null;

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        if (item.price.product === CAREER_ADVISOR_PRODUCT_ID) {
          advisorSubscription = sub;
          break;
        }
      }
      if (advisorSubscription) break;
    }

    if (!advisorSubscription) {
      throw new Error("No Career Advisor subscription found");
    }

    const expiryDate = new Date(advisorSubscription.current_period_end * 1000);
    const formattedDate = expiryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    logStep("Sending reminder email", { 
      to: email, 
      expiryDate: formattedDate,
      daysUntilExpiry 
    });

    // Send reminder email
    const emailResponse = await resend.emails.send({
      from: "RIMO Career Advisor <advisor@theleadersrow.com>",
      to: [email],
      subject: daysUntilExpiry <= 1 
        ? "Your Career Advisor Pro subscription expires tomorrow!" 
        : `Your Career Advisor Pro subscription expires in ${daysUntilExpiry} days`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">RIMO Career Advisor</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi ${customerName},</p>
            
            <p style="font-size: 16px;">
              This is a friendly reminder that your <strong>Career Advisor Pro</strong> subscription 
              ${daysUntilExpiry <= 1 ? 'expires tomorrow' : `will renew on <strong>${formattedDate}</strong>`}.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>What you get with Pro:</strong><br>
                ✓ Unlimited career coaching conversations<br>
                ✓ Expert guidance from AI trained on executive coaching<br>
                ✓ Personalized advice for your unique situation<br>
                ✓ Available 24/7 whenever you need support
              </p>
            </div>
            
            <p style="font-size: 16px;">
              If you'd like to manage your subscription or update your payment method, 
              you can do so anytime from the Career Advisor chat.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://theleadersrow.com/career-coach" 
                 style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Continue Your Career Journey →
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Thank you for being a Pro member. We're here to help you achieve your career goals.
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The RIMO Team
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 The Leader's Row. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { emailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        expiryDate: formattedDate 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
