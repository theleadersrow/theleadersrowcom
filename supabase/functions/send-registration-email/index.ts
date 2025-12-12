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

interface RegistrationEmailRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  occupation: string;
  program: string;
}

// Check and update rate limit
async function checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000).toISOString();
  
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
    
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
    
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.request_count - 1 };
  }
  
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

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
}

// Sanitize inputs for HTML
const sanitize = (str: string) => str.replace(/[<>&"']/g, (c) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
}[c] || c));

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getProgramName = (program: string): string => {
  switch (program) {
    case "200k-method":
      return "200K Method ($2,000)";
    case "weekly-edge":
      return "Weekly Edge ($100/month)";
    default:
      return sanitize(program);
  }
};

const getProgramLink = (program: string): string => {
  switch (program) {
    case "200k-method":
      return "https://theleadersrow.com/200k-method";
    case "weekly-edge":
      return "https://theleadersrow.com/weekly-edge";
    default:
      return "https://theleadersrow.com";
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-registration-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "send-registration-email");
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

    const { fullName, email, phone, address, city, state, country, zipcode, occupation, program }: RegistrationEmailRequest = await req.json();
    
    // Input validation
    if (!fullName || typeof fullName !== "string" || fullName.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (phone && (typeof phone !== "string" || phone.length > 30)) {
      return new Response(JSON.stringify({ error: "Invalid phone" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (address && (typeof address !== "string" || address.length > 200)) {
      return new Response(JSON.stringify({ error: "Invalid address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!program || typeof program !== "string" || program.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid program" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize all inputs
    const safeFullName = sanitize(fullName);
    const safeEmail = sanitize(email);
    const safePhone = phone ? sanitize(phone) : '';
    const safeAddress = address ? sanitize(address) : '';
    const safeCity = city ? sanitize(city) : '';
    const safeState = state ? sanitize(state) : '';
    const safeCountry = country ? sanitize(country) : '';
    const safeZipcode = zipcode ? sanitize(zipcode) : '';
    const safeOccupation = occupation ? sanitize(occupation) : '';
    
    console.log("Received registration submission:", { fullName: safeFullName, email: safeEmail, program });

    const programName = getProgramName(program);
    const programLink = getProgramLink(program);
    const fullAddress = `${safeAddress}, ${safeCity}, ${safeState} ${safeZipcode}, ${safeCountry}`;

    // Send notification email to The Leader's Row
    const notificationResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      to: ["theleadersrow@gmail.com"],
      subject: `New Registration: ${safeFullName} - ${programName}`,
      html: `
        <h2>New Program Registration</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Full Name</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeFullName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Address</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${fullAddress}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Occupation</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeOccupation}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Program</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${programName}</td>
          </tr>
        </table>
        <hr style="margin: 20px 0;">
        <p><em>Sent from The Leader's Row website registration form</em></p>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation email to the registrant
    const confirmationResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      reply_to: "theleadersrow@gmail.com",
      to: [email],
      subject: "Registration Received - The Leader's Row",
      html: `
        <h1>Thank you for registering, ${safeFullName}!</h1>
        <p>We have received your registration for <strong><a href="${programLink}" style="color: #B8860B;">${programName}</a></strong>.</p>
        <p>A member of our team will contact you within 24–48 hours to complete your registration and guide you through next steps.</p>
        <h3>Your Registration Details:</h3>
        <ul>
          <li><strong>Program:</strong> ${programName}</li>
          <li><strong>Email:</strong> ${safeEmail}</li>
          <li><strong>Phone:</strong> ${safePhone}</li>
        </ul>
        <p>If you have any questions in the meantime, feel free to <a href="https://theleadersrow.com/contact" style="color: #B8860B;">contact us</a> or reply to this email.</p>
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
    console.error("Error in send-registration-email function:", error);
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
