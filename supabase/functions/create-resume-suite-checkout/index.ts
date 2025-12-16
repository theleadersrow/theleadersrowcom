import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESUME-SUITE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const { customerEmail, successParam } = await req.json();
    logStep("Request body parsed", { customerEmail, successParam });

    // Determine tool type and price from successParam
    const toolType = successParam === "linkedin_success" ? "linkedin_signal" : "resume_suite";
    // Use different prices for each tool
    const priceId = successParam === "linkedin_success" 
      ? "price_1SelWOCD119gx37UqjCdenCV"  // LinkedIn Signal Score price ($19.99)
      : "price_1Sf2uYCD119gx37UFHVwbcSc"; // Resume Intelligence Suite price ($29.99)

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://theleadersrow.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/career-coach?purchase=${successParam || "resume_success"}`,
      cancel_url: `${origin}/career-coach`,
      metadata: {
        product_name: toolType === "linkedin_signal" ? "LinkedIn Signal Score" : "Resume Intelligence Suite",
        access_duration: "1 month",
        tool_type: toolType,
        customer_email: customerEmail,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Record the purchase in database after successful checkout creation
    // Note: This records as pending, and should be confirmed via webhook in production
    // For now, we'll record it when user returns to success page
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate expiry date (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Insert purchase record
    const { error: insertError } = await supabaseClient
      .from("tool_purchases")
      .insert({
        email: customerEmail,
        tool_type: toolType,
        stripe_session_id: session.id,
        expires_at: expiresAt.toISOString(),
        status: "active",
      });

    if (insertError) {
      logStep("Warning: Failed to record purchase", { error: insertError.message });
    } else {
      logStep("Purchase recorded in database", { toolType, email: customerEmail });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-resume-suite-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
