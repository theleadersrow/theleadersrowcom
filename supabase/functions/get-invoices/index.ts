import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-INVOICES] ${step}${detailsStr}`);
};

interface InvoiceRequest {
  customerEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const { customerEmail }: InvoiceRequest = await req.json();
    
    if (!customerEmail) {
      throw new Error("Customer email is required");
    }
    logStep("Request parsed", { customerEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find the Stripe customer by email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(
        JSON.stringify({ invoices: [], message: "No customer found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Fetch invoices for this customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
    });

    logStep("Invoices fetched", { count: invoices.data.length });

    // Format invoices for frontend
    const formattedInvoices = invoices.data.map((invoice: any) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      due_date: invoice.due_date,
      paid_at: invoice.status_transitions?.paid_at,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      description: invoice.description || invoice.lines?.data?.[0]?.description || "Invoice",
      period_start: invoice.period_start,
      period_end: invoice.period_end,
    }));

    return new Response(
      JSON.stringify({ invoices: formattedInvoices }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logStep("ERROR in get-invoices", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});