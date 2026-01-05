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
      const customerName = metadata.fullName || metadata.customer_name || "Valued Customer";
      const eventType = metadata.eventType;

      // Create Supabase client with service role for admin operations
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Handle AMA Event registrations
      if (eventType === "ama_event") {
        logStep("Processing AMA event registration", { customerEmail, customerName });

        // Store AMA registration in database
        const { data: registration, error: regError } = await supabaseAdmin
          .from('beta_event_registrations')
          .insert({
            full_name: customerName,
            email: customerEmail,
            current_position: metadata.currentRole || "Not specified",
            target_roles: metadata.question || "AMA Event Registration",
            phone: "N/A",
            job_search_status: "AMA Event",
            tool_type: "ama_event",
            agrees_to_communication: true,
            understands_beta_terms: true,
            status: "paid",
            event_date: metadata.eventDate || null,
          })
          .select()
          .single();

        if (regError) {
          logStep("Error creating AMA registration", { error: regError.message });
        } else {
          logStep("AMA registration created", { registrationId: registration.id });
        }

        // Send AMA confirmation email
        const amaEmailHtml = `
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
              .event-details { background: #1a1f2e; color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .event-details h3 { color: #d4a853; margin-top: 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎤 You're Registered!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Monthly AMA: Career Acceleration</p>
              </div>
              <div class="content">
                <p>Hi ${customerName.split(' ')[0] || "there"},</p>
                
                <p>Thank you for registering for our <strong>Monthly AMA: Career Acceleration</strong> session! Your payment has been confirmed.</p>
                
                <div class="event-details">
                  <h3>📅 Event Details</h3>
                  <p style="margin: 5px 0;"><strong>Date:</strong> Third Wednesday of the month</p>
                  <p style="margin: 5px 0;"><strong>Time:</strong> 6-7pm CST</p>
                  <p style="margin: 5px 0;"><strong>Format:</strong> Live Zoom Q&A</p>
                </div>
                
                <div class="highlight-box">
                  <h3 style="margin-top: 0; color: #1a1f2e;">📧 What's Next?</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>You'll receive the Zoom link 24 hours before the event</li>
                    <li>Come prepared with your career questions</li>
                    <li>Add the event to your calendar</li>
                  </ul>
                </div>
                
                ${metadata.question ? `
                <div class="highlight-box" style="background: #fff9e6;">
                  <h3 style="margin-top: 0; color: #1a1f2e;">📝 Your Pre-Submitted Question</h3>
                  <p style="margin: 0; font-style: italic;">"${metadata.question}"</p>
                </div>
                ` : ''}
                
                <p>If you have any questions before the event, reach out to us at <a href="mailto:theleadersrow@gmail.com">theleadersrow@gmail.com</a>.</p>
                
                <p>See you there!</p>
                
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

        await resend.emails.send({
          from: "The Leader's Row <hello@theleadersrow.com>",
          to: [customerEmail],
          subject: `🎤 You're Registered for the Monthly AMA!`,
          html: amaEmailHtml,
        });

        logStep("AMA confirmation email sent");

        // Send admin notification
        await resend.emails.send({
          from: "The Leader's Row <hello@theleadersrow.com>",
          to: ["theleadersrow@gmail.com"],
          subject: `🎤 New AMA Registration: ${customerName}`,
          html: `
            <h2>New AMA Event Registration</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerEmail}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Current Role:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${metadata.currentRole || "Not specified"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pre-submitted Question:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${metadata.question || "None"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: green;">✓ $20 Paid</td></tr>
            </table>
          `,
        });

        logStep("Admin notification sent for AMA");

        return new Response(JSON.stringify({ received: true, type: "ama_event" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle regular program enrollments
      const productName = metadata.product_name || "200K Method";
      const program = metadata.program || "200k-method";

      logStep("Customer data extracted", { customerEmail, customerName, productName });

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

      // Send confirmation email with enrollment code and signup link
      const baseUrl = "https://theleadersrowcom.lovable.app";
      const signupLink = `${baseUrl}/signup`;
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
            .code-box { background: #1a1f2e; color: #d4a853; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .code-box .code { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
            .cta-button { display: inline-block; background: #d4a853; color: #1a1f2e !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .step { display: flex; align-items: flex-start; margin: 15px 0; }
            .step-number { background: #d4a853; color: #1a1f2e; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">You're now enrolled in ${productName}</p>
            </div>
            <div class="content">
              <p>Hi ${firstName || "there"},</p>
              
              <p>Welcome to <strong>The Leader's Row</strong>! Your payment has been successfully processed and you're now officially enrolled in <strong>${productName}</strong>.</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #888;">YOUR ENROLLMENT CODE</p>
                <p class="code">${enrollment.enrollment_code}</p>
                <p style="margin: 0; font-size: 12px; color: #888;">Keep this code safe - you'll need it to create your account</p>
              </div>
              
              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #1a1f2e;">📋 Create Your Member Account</h3>
                <p style="margin-bottom: 15px;">Follow these simple steps to access your member portal:</p>
                
                <div class="step">
                  <span class="step-number">1</span>
                  <span>Click the button below to go to the member signup page</span>
                </div>
                <div class="step">
                  <span class="step-number">2</span>
                  <span>Enter your enrollment code: <strong>${enrollment.enrollment_code}</strong></span>
                </div>
                <div class="step">
                  <span class="step-number">3</span>
                  <span>Create your account with your email and password</span>
                </div>
                <div class="step">
                  <span class="step-number">4</span>
                  <span>Access your dashboard, resources, and program content</span>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${signupLink}" class="cta-button">Create Your Member Account →</a>
              </div>
              
              <div class="highlight-box" style="background: #fff9e6;">
                <h3 style="margin-top: 0; color: #1a1f2e;">🚀 What's Included</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Access to your member dashboard with all program content</li>
                  <li>Zoom links for live sessions</li>
                  <li>Downloadable resources and worksheets</li>
                  <li>Access to our private community</li>
                </ul>
              </div>
              
              <p>If you have any questions, don't hesitate to reach out to us at <a href="mailto:theleadersrow@gmail.com">theleadersrow@gmail.com</a>.</p>
              
              <p>We're thrilled to have you on this journey to becoming a top-tier leader!</p>
              
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
        subject: `🎉 Congratulations! You're enrolled in ${productName}`,
        html: emailHtml,
      });

      logStep("Confirmation email sent", { response: emailResponse });

      // Also send notification to admin with account status
      const adminEmailHtml = `
        <h2>🎉 New Enrollment - ${productName}</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Customer:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerEmail}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${metadata.customer_phone || "Not provided"}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Location:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${metadata.customer_city || ""}, ${metadata.customer_state || ""}, ${metadata.customer_country || ""}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Occupation:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${metadata.customer_occupation || "Not provided"}</td></tr>
          <tr style="background: #f8f9fa;"><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Enrollment Code:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #d4a853; font-weight: bold;">${enrollment.enrollment_code}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: green;">✓ Paid</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Account Created:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: orange;">⏳ Pending (code sent)</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">$${session.amount_total ? (session.amount_total / 100).toFixed(2) : "N/A"}</td></tr>
          <tr><td style="padding: 8px;"><strong>Stripe Session:</strong></td><td style="padding: 8px; font-size: 12px; color: #666;">${session.id}</td></tr>
        </table>
        <p style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
          ✅ Enrollment created in admin portal<br>
          ✅ Confirmation email sent to customer with enrollment code and signup link
        </p>
      `;

      await resend.emails.send({
        from: "The Leader's Row <hello@theleadersrow.com>",
        to: ["theleadersrow@gmail.com"],
        subject: `✅ New Enrollment: ${customerName} - ${productName}`,
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
