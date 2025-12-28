import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Quarterly subscription price IDs
const PRICE_IDS = {
  resume_suite: "price_1SjAkxCD119gx37UThRkixBJ", // $99/quarter
  linkedin_signal: "price_1SjAlCCD119gx37UHRTK3O1L", // $99/quarter
  interview_prep: "price_1SjAlMCD119gx37UVMQYGyJo", // $249/quarter
  bundle: "price_1SjAn0CD119gx37U5A4XyIiI", // $399/quarter for all 3
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TOOL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { email, toolType } = await req.json();
    
    if (!email || !toolType) {
      throw new Error("Email and toolType are required");
    }

    if (!PRICE_IDS[toolType as keyof typeof PRICE_IDS]) {
      throw new Error(`Invalid tool type: ${toolType}`);
    }

    logStep("Processing checkout", { email, toolType });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const priceId = PRICE_IDS[toolType as keyof typeof PRICE_IDS];
    
    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          tool_type: toolType,
          email: email,
        },
      },
      success_url: `${req.headers.get("origin")}/career-coach?purchase=${toolType}_success`,
      cancel_url: `${req.headers.get("origin")}/career-coach`,
      metadata: {
        tool_type: toolType,
        email: email,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
