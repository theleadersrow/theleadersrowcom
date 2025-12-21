import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-ADVISOR-SUBSCRIBERS] ${step}${detailsStr}`);
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const CAREER_ADVISOR_PRODUCT_ID = "prod_TeCZHGXYMzyJNv";

    // List all subscriptions for the Career Advisor product
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ["data.customer"],
    });

    logStep("Fetched subscriptions", { count: subscriptions.data.length });

    const advisorSubscribers = [];

    for (const sub of subscriptions.data) {
      // Check if this subscription includes the Career Advisor product
      const hasAdvisorProduct = sub.items.data.some(
        (item: Stripe.SubscriptionItem) => item.price.product === CAREER_ADVISOR_PRODUCT_ID
      );

      if (hasAdvisorProduct) {
        const customer = sub.customer as Stripe.Customer;
        const advisorItem = sub.items.data.find(
          (item: Stripe.SubscriptionItem) => item.price.product === CAREER_ADVISOR_PRODUCT_ID
        );

        advisorSubscribers.push({
          id: sub.id,
          email: customer.email || "",
          name: customer.name,
          customerId: customer.id,
          subscriptionId: sub.id,
          status: sub.status,
          currentPeriodStart: sub.current_period_start * 1000,
          currentPeriodEnd: sub.current_period_end * 1000,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          amount: advisorItem?.price.unit_amount || 0,
          currency: advisorItem?.price.currency || "usd",
          interval: advisorItem?.price.recurring?.interval || "month",
          created: sub.created * 1000,
        });
      }
    }

    logStep("Found advisor subscribers", { count: advisorSubscribers.length });

    return new Response(
      JSON.stringify({ subscribers: advisorSubscribers }),
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
