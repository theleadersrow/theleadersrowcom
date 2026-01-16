import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-200K-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { 
      fullName, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      country, 
      zipcode, 
      occupation 
    } = await req.json();

    if (!email || !fullName) {
      throw new Error("Email and full name are required");
    }

    logStep("Processing checkout", { email, fullName });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Use the original price for $2000
    const priceId = "price_1SdcR1CD119gx37UY1m7KYal";

    // Create checkout session with all customer metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/register?program=200k-method&payment=success`,
      cancel_url: `${req.headers.get("origin")}/register?program=200k-method`,
      metadata: {
        fullName: fullName,
        customer_email: email,
        customer_phone: phone || "",
        customer_address: address || "",
        customer_city: city || "",
        customer_state: state || "",
        customer_country: country || "",
        customer_zipcode: zipcode || "",
        customer_occupation: occupation || "",
        product_name: "The 200K Method",
        program: "200k-method",
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
