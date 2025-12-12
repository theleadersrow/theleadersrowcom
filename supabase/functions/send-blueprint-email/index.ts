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

interface BlueprintEmailRequest {
  email: string;
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

const handler = async (req: Request): Promise<Response> => {
  console.log("send-blueprint-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "send-blueprint-email");
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
    
    const { email }: BlueprintEmailRequest = await req.json();
    
    // Input validation
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log("Sending quick start guide email to:", email);

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      reply_to: "theleadersrow@gmail.com",
      to: [email],
      subject: "Here's your Quick Start Guide",
      text: `Hi there,

Thanks for downloading the 200K Method Quick Start Guide.

Here are the 3 career accelerators that separate $200K+ Product Leaders from everyone else — with actionable tips you can use today.

---

1. STRATEGIC POSITIONING

The problem: Most PMs think great work speaks for itself. It doesn't. The PMs getting promoted and landing $200K+ offers aren't necessarily better at their jobs — they're better at making their value visible.

Quick win you can apply today:
Write down your top 3 accomplishments from the last 6 months. For each one, answer: "What business outcome did this drive?" If you can't tie it to revenue, retention, or efficiency, reframe it until you can. This is your positioning foundation.

The deeper work: In the full 200K Method, we spend 2 weeks engineering your complete personal brand narrative — from LinkedIn to how you introduce yourself in meetings.

---

2. INTERVIEW MASTERY

The problem: Most PMs prepare for interviews by reviewing their resume and practicing STAR stories. But the PMs who command $200K+ offers do something different — they control the narrative.

Quick win you can apply today:
Before your next interview (or even your next 1:1 with leadership), prepare your "Signature Story" — one project that showcases strategic thinking, cross-functional leadership, and measurable impact. Practice telling it in exactly 90 seconds.

The deeper work: The 200K Method includes advanced frameworks for product sense, execution, and leadership interviews — plus live mock sessions with real-time feedback.

---

3. EXECUTIVE PRESENCE

The problem: You've probably noticed that some people command attention when they speak, while others get talked over. This isn't charisma — it's a learnable skill called executive presence.

Quick win you can apply today:
In your next meeting, try the "Pause and Land" technique: Before making your key point, pause for 2 seconds. Then state your point clearly in one sentence. Pause again before elaborating. This simple pattern signals confidence and authority.

The deeper work: We dedicate an entire module to executive communication — including how to present to leadership, influence without authority, and navigate high-stakes conversations.

---

This guide gives you a starting point. But if you're serious about breaking into the top 10% of PM roles, the full 200K Method program goes much deeper — with live coaching, hands-on workshops, and a community of ambitious professionals pushing each other forward.

Learn more: https://theleadersrow.com/200k-method

Questions? Just reply to this email.

Best,
The Leader's Row Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <p>Hi there,</p>
  
  <p>Thanks for downloading the 200K Method Quick Start Guide.</p>
  
  <p>Here are the <strong>3 career accelerators</strong> that separate $200K+ Product Leaders from everyone else — with actionable tips you can use today.</p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
  
  <h2 style="font-size: 18px; color: #1a2332; margin-bottom: 10px;">1. Strategic Positioning</h2>
  
  <p><strong>The problem:</strong> Most PMs think great work speaks for itself. It doesn't. The PMs getting promoted and landing $200K+ offers aren't necessarily better at their jobs — they're better at making their value <em>visible</em>.</p>
  
  <div style="background: #f8f9fa; padding: 15px 20px; border-left: 3px solid #B8860B; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Quick win you can apply today:</strong></p>
    <p style="margin: 0;">Write down your top 3 accomplishments from the last 6 months. For each one, answer: "What business outcome did this drive?" If you can't tie it to revenue, retention, or efficiency, reframe it until you can. This is your positioning foundation.</p>
  </div>
  
  <p style="color: #666; font-size: 14px;"><em>The deeper work: In the full 200K Method, we spend 2 weeks engineering your complete personal brand narrative — from LinkedIn to how you introduce yourself in meetings.</em></p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
  
  <h2 style="font-size: 18px; color: #1a2332; margin-bottom: 10px;">2. Interview Mastery</h2>
  
  <p><strong>The problem:</strong> Most PMs prepare for interviews by reviewing their resume and practicing STAR stories. But the PMs who command $200K+ offers do something different — they control the narrative.</p>
  
  <div style="background: #f8f9fa; padding: 15px 20px; border-left: 3px solid #B8860B; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Quick win you can apply today:</strong></p>
    <p style="margin: 0;">Before your next interview (or even your next 1:1 with leadership), prepare your "Signature Story" — one project that showcases strategic thinking, cross-functional leadership, and measurable impact. Practice telling it in exactly 90 seconds.</p>
  </div>
  
  <p style="color: #666; font-size: 14px;"><em>The deeper work: The 200K Method includes advanced frameworks for product sense, execution, and leadership interviews — plus live mock sessions with real-time feedback.</em></p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
  
  <h2 style="font-size: 18px; color: #1a2332; margin-bottom: 10px;">3. Executive Presence</h2>
  
  <p><strong>The problem:</strong> You've probably noticed that some people command attention when they speak, while others get talked over. This isn't charisma — it's a learnable skill called executive presence.</p>
  
  <div style="background: #f8f9fa; padding: 15px 20px; border-left: 3px solid #B8860B; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Quick win you can apply today:</strong></p>
    <p style="margin: 0;">In your next meeting, try the "Pause and Land" technique: Before making your key point, pause for 2 seconds. Then state your point clearly in one sentence. Pause again before elaborating. This simple pattern signals confidence and authority.</p>
  </div>
  
  <p style="color: #666; font-size: 14px;"><em>The deeper work: We dedicate an entire module to executive communication — including how to present to leadership, influence without authority, and navigate high-stakes conversations.</em></p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
  
  <p>This guide gives you a starting point. But if you're serious about breaking into the top 10% of PM roles, the full 200K Method program goes much deeper — with live coaching, hands-on workshops, and a community of ambitious professionals pushing each other forward.</p>
  
  <p><a href="https://theleadersrow.com/200k-method" style="color: #B8860B;">Learn more about the 200K Method →</a></p>
  
  <p>Questions? Just reply to this email.</p>
  
  <p>Best,<br>
  <strong>The Leader's Row Team</strong></p>
  
</body>
</html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-blueprint-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);