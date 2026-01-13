import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT-STATUS] ${step}${detailsStr}`);
};

interface PaymentIntent {
  id: string;
  status: string;
  created: number;
  amount: number;
  currency: string;
}

interface CheckoutSession {
  id: string;
  status: string;
  payment_status: string;
  created: number;
  amount_total: number | null;
  currency: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { email } = await req.json();
    if (!email) throw new Error("Email is required");
    logStep("Checking payment for email", { email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for recent successful payments (within last hour)
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    
    // First check for customers with this email
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found customer", { customerId });

      // Check for recent successful payment intents
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 5,
      });

      const recentSuccessfulPayment = paymentIntents.data.find(
        (pi: PaymentIntent) => pi.status === "succeeded" && pi.created >= oneHourAgo
      );

      if (recentSuccessfulPayment) {
        logStep("Found recent successful payment", { 
          paymentId: recentSuccessfulPayment.id,
          amount: recentSuccessfulPayment.amount 
        });
        return new Response(
          JSON.stringify({ 
            paid: true, 
            paymentId: recentSuccessfulPayment.id,
            amount: recentSuccessfulPayment.amount / 100,
            currency: recentSuccessfulPayment.currency
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Also check for active subscriptions (for recurring payments like Weekly Edge)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        // Check if subscription was created recently (within last hour)
        if (subscription.created >= oneHourAgo) {
          logStep("Found recent subscription", { subscriptionId: subscription.id });
          return new Response(
            JSON.stringify({ 
              paid: true, 
              subscriptionId: subscription.id,
              isSubscription: true
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }
    }

    // Also check checkout sessions by customer email (for Payment Links)
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      customer_details: { email },
    });

    const recentCompletedSession = sessions.data.find(
      (session: CheckoutSession) => 
        session.status === "complete" && 
        session.payment_status === "paid" &&
        session.created >= oneHourAgo
    );

    if (recentCompletedSession) {
      logStep("Found completed checkout session", { sessionId: recentCompletedSession.id });
      return new Response(
        JSON.stringify({ 
          paid: true, 
          sessionId: recentCompletedSession.id,
          amount: (recentCompletedSession.amount_total || 0) / 100,
          currency: recentCompletedSession.currency
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("No recent payment found");
    return new Response(
      JSON.stringify({ paid: false }),
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
