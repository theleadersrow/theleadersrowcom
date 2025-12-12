import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const { 
      priceId, 
      productName,
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerState,
      customerCountry,
      customerZipcode,
      customerOccupation,
      program,
      mode = "payment"
    } = await req.json();
    
    logStep("Request body parsed", { priceId, productName, customerEmail, mode });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check for authenticated user (optional for one-time payments)
    let userEmail = customerEmail;
    let customerId: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        userEmail = data.user.email;
        logStep("User authenticated", { email: userEmail });
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if a Stripe customer exists for this user
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "https://theleadersrow.com";

    // Determine cancel URL based on program
    const cancelUrl = program === "weekly-edge" 
      ? `${origin}/weekly-edge` 
      : `${origin}/200k-method`;

    // Create checkout session with customer metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode === "subscription" ? "subscription" : "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        product_name: productName || "200K Method",
        program: program || "200k-method",
        customer_name: customerName || "",
        customer_email: customerEmail || userEmail || "",
        customer_phone: customerPhone || "",
        customer_address: customerAddress || "",
        customer_city: customerCity || "",
        customer_state: customerState || "",
        customer_country: customerCountry || "",
        customer_zipcode: customerZipcode || "",
        customer_occupation: customerOccupation || "",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
