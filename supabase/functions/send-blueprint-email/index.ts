import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BlueprintEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-blueprint-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: BlueprintEmailRequest = await req.json();
    
    console.log("Sending quick start guide email to:", email);

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      reply_to: "theleadersrow@gmail.com",
      to: [email],
      subject: "Here's your Quick Start Guide",
      text: `Hi there,

Thanks for downloading the 200K Method Quick Start Guide.

Here are the 3 career accelerators that separate $200K+ Product Leaders from everyone else:

1. Strategic Positioning
Most PMs focus on doing great work. Top earners focus on being known for great work. Your personal brand isn't vanity - it's leverage.

2. Interview Mastery  
The difference between a $150K and $200K+ offer often comes down to how you communicate your value, not what you've done.

3. Executive Presence
Senior leaders don't just have skills - they have presence. The way you speak, present, and influence determines your ceiling.

This is just a preview. The full 200K Method program covers 8 comprehensive modules with live coaching and personalized feedback.

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
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 580px; margin: 0 auto; padding: 20px;">
  
  <p>Hi there,</p>
  
  <p>Thanks for downloading the 200K Method Quick Start Guide.</p>
  
  <p>Here are the <strong>3 career accelerators</strong> that separate $200K+ Product Leaders from everyone else:</p>
  
  <p><strong>1. Strategic Positioning</strong><br>
  Most PMs focus on doing great work. Top earners focus on being <em>known</em> for great work. Your personal brand isn't vanity — it's leverage.</p>
  
  <p><strong>2. Interview Mastery</strong><br>
  The difference between a $150K and $200K+ offer often comes down to <em>how</em> you communicate your value, not <em>what</em> you've done.</p>
  
  <p><strong>3. Executive Presence</strong><br>
  Senior leaders don't just have skills — they have <em>presence</em>. The way you speak, present, and influence determines your ceiling.</p>
  
  <p style="color: #666; font-style: italic;">This is just a preview. The full 200K Method program covers 8 comprehensive modules with live coaching and personalized feedback.</p>
  
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