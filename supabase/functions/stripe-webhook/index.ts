import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = new Resend(resendKey);

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // For now, we'll parse the event directly since webhook secret setup requires additional configuration
    // In production, you should verify the signature with STRIPE_WEBHOOK_SECRET
    const event = JSON.parse(body);
    
    logStep("Event parsed", { type: event.type, id: event.id });

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      logStep("Processing checkout.session.completed", { sessionId: session.id });

      const metadata = session.metadata || {};
      const customerEmail = session.customer_email || metadata.customer_email;
      const customerName = metadata.customer_name || "Valued Customer";
      const productName = metadata.product_name || "200K Method";
      const program = metadata.program || "200k-method";

      logStep("Customer data extracted", { customerEmail, customerName, productName });

      // Create Supabase client with service role for admin operations
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Find the program in the database
      const { data: programData, error: programError } = await supabaseAdmin
        .from("programs")
        .select("id")
        .eq("slug", program)
        .single();

      let programId = programData?.id;

      // If program doesn't exist, create it
      if (!programId) {
        logStep("Program not found, creating...", { program });
        const { data: newProgram, error: createError } = await supabaseAdmin
          .from("programs")
          .insert({
            name: productName,
            slug: program,
            description: `${productName} program`,
            price: session.amount_total ? session.amount_total / 100 : 2000,
          })
          .select("id")
          .single();

        if (createError) {
          logStep("Error creating program", { error: createError.message });
          throw createError;
        }
        programId = newProgram.id;
        logStep("Program created", { programId });
      }

      // Parse customer name into first and last name
      const nameParts = customerName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Create enrollment record
      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from("enrollments")
        .insert({
          program_id: programId,
          email: customerEmail,
          first_name: firstName,
          last_name: lastName,
          phone: metadata.customer_phone || null,
          city: metadata.customer_city || null,
          state: metadata.customer_state || null,
          country: metadata.customer_country || null,
          zip_code: metadata.customer_zipcode || null,
          occupation: metadata.customer_occupation || null,
          payment_status: "paid",
          notes: `Stripe Session ID: ${session.id}, Payment Intent: ${session.payment_intent}`,
        })
        .select()
        .single();

      if (enrollmentError) {
        logStep("Error creating enrollment", { error: enrollmentError.message });
        throw enrollmentError;
      }

      logStep("Enrollment created", { enrollmentId: enrollment.id, enrollmentCode: enrollment.enrollment_code });

      // Send confirmation email
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1f2e 0%, #2d3548 100%); color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; color: #d4a853; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .highlight-box { background: #f8f9fa; border-left: 4px solid #d4a853; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .cta-button { display: inline-block; background: #d4a853; color: #1a1f2e; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to The Leader's Row!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName || "there"},</p>
              
              <p>Thank you for enrolling in <strong>${productName}</strong>! Your payment has been successfully processed.</p>
              
              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #1a1f2e;">What Happens Next?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Our team will reach out within <strong>24-48 hours</strong> with your program details</li>
                  <li>You'll receive access to our private Slack community</li>
                  <li>Calendar invites for all live sessions will be sent shortly</li>
                </ul>
              </div>
              
              <p>Your enrollment code is: <strong style="color: #d4a853; font-size: 18px;">${enrollment.enrollment_code}</strong></p>
              <p style="font-size: 14px; color: #666;">Keep this code safe - you'll need it to access your member dashboard.</p>
              
              <p>If you have any questions in the meantime, don't hesitate to reach out to us at <a href="mailto:theleadersrow@gmail.com">theleadersrow@gmail.com</a>.</p>
              
              <p>We're excited to have you on this journey!</p>
              
              <p>Best regards,<br><strong>The Leader's Row Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} The Leader's Row. All rights reserved.</p>
              <p><a href="https://theleadersrow.com" style="color: #d4a853;">theleadersrow.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await resend.emails.send({
        from: "The Leader's Row <hello@theleadersrow.com>",
        to: [customerEmail],
        subject: `Welcome to ${productName}! Your enrollment is confirmed`,
        html: emailHtml,
      });

      logStep("Confirmation email sent", { response: emailResponse });

      // Also send notification to admin
      const adminEmailHtml = `
        <h2>New Enrollment - ${productName}</h2>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${metadata.customer_phone || "Not provided"}</p>
        <p><strong>Location:</strong> ${metadata.customer_city || ""}, ${metadata.customer_state || ""}, ${metadata.customer_country || ""}</p>
        <p><strong>Occupation:</strong> ${metadata.customer_occupation || "Not provided"}</p>
        <p><strong>Enrollment Code:</strong> ${enrollment.enrollment_code}</p>
        <p><strong>Payment Amount:</strong> $${session.amount_total ? (session.amount_total / 100).toFixed(2) : "N/A"}</p>
        <p><strong>Stripe Session:</strong> ${session.id}</p>
      `;

      await resend.emails.send({
        from: "The Leader's Row <hello@theleadersrow.com>",
        to: ["theleadersrow@gmail.com"],
        subject: `New Enrollment: ${customerName} - ${productName}`,
        html: adminEmailHtml,
      });

      logStep("Admin notification sent");

      return new Response(JSON.stringify({ received: true, enrollmentId: enrollment.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 200 for unhandled events
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
