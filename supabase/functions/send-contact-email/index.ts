import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 3,
  windowMinutes: 60,
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Check and update rate limit
async function checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000).toISOString();
  
  // Check current rate limit
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart)
    .single();

  if (existing) {
    if (existing.request_count >= RATE_LIMIT.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment counter
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
    
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.request_count - 1 };
  }
  
  // Create new rate limit record
  await supabase
    .from("rate_limits")
    .upsert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    }, { onConflict: "identifier,endpoint" });
  
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
}

// Get client IP from request
function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "send-contact-email");
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(RATE_LIMIT.windowMinutes * 60),
            ...corsHeaders 
          },
        }
      );
    }
    
    const { name, email, phone, message }: ContactEmailRequest = await req.json();
    
    // Input validation
    if (!name || typeof name !== "string" || name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Sanitize inputs for HTML
    const sanitize = (str: string) => str.replace(/[<>&"']/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    }[c] || c));
    
    const safeName = sanitize(name);
    const safeEmail = sanitize(email);
    const safePhone = phone ? sanitize(phone) : '';
    const safeMessage = sanitize(message);
    
    console.log("Received contact form submission:", { name: safeName, email: safeEmail });

    // Send notification email to The Leader's Row
    const notificationResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      to: ["theleadersrow@gmail.com"],
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from The Leader's Row website contact form</em></p>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      reply_to: "theleadersrow@gmail.com",
      to: [email],
      subject: "We received your message!",
      html: `
        <h1>Thank you for reaching out, ${safeName}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>In the meantime, feel free to explore our programs:</p>
        <ul>
          <li><a href="https://theleadersrow.com/200k-method" style="color: #B8860B;"><strong>200K Method</strong></a> - Our 8-week accelerator program</li>
          <li><a href="https://theleadersrow.com/weekly-edge" style="color: #B8860B;"><strong>Weekly Edge</strong></a> - Ongoing membership for continuous growth</li>
        </ul>
        <p>Best regards,<br>The Leader's Row Team</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;">
        <p style="font-size: 12px; color: #666;"><a href="https://theleadersrow.com" style="color: #B8860B;">theleadersrow.com</a></p>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notificationResponse,
        confirmation: confirmationResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);