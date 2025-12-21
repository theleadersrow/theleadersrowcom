import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-ADVISOR-PAYMENTS] ${step}${detailsStr}`);
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

    const { customerId } = await req.json();
    if (!customerId) throw new Error("Customer ID is required");
    logStep("Request body parsed", { customerId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get payment intents for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 50,
    });

    logStep("Fetched payment intents", { count: paymentIntents.data.length });

    const payments = paymentIntents.data.map((pi: Stripe.PaymentIntent) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created * 1000,
      description: pi.description,
    }));

    return new Response(
      JSON.stringify({ payments }),
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
