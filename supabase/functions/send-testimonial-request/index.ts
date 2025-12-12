import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestimonialRequest {
  email: string;
  firstName?: string;
  currentLevel: string;
  overallScore: number;
  sessionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-testimonial-request function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      firstName,
      currentLevel, 
      overallScore,
      sessionId
    }: TestimonialRequest = await req.json();
    
    console.log("Sending testimonial request email to:", email);

    const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
    const baseUrl = "https://theleadersrow.com";

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      reply_to: "theleadersrow@gmail.com",
      to: [email],
      subject: "Was your Career Intelligence Report accurate?",
      text: `${greeting}

A few days ago, you completed The Leader's Row Strategic Benchmark Assessment and received your Career Intelligence Report.

We identified you as a ${currentLevel} Product Manager with a readiness score of ${Math.round(overallScore)}/100.

We'd love to hear from you:

1. WAS YOUR REPORT ACCURATE?
Did the insights resonate with where you are in your career? What surprised you the most?

Simply reply to this email with your thoughts—we read every response.

2. WANT TO BE FEATURED AS A SUCCESS STORY?
We're looking for ambitious product leaders to feature in our upcoming case studies and testimonials.

If you'd like to share your career journey and how The Leader's Row has helped you think differently about your path, reply with "I'm interested" and we'll follow up.

Your feedback helps us improve the assessment for thousands of product managers.

Thank you for being part of The Leader's Row community.

Best,
The Leader's Row Team

---
Unsubscribe: ${baseUrl}/contact
`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #1a2332; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f0;">
  
  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a2332 0%, #2d3748 100%); padding: 25px 20px;">
    <tr>
      <td align="center">
        <h1 style="color: #B8860B; font-size: 20px; margin: 0; font-weight: 400; letter-spacing: 1px;">THE LEADER'S ROW</h1>
      </td>
    </tr>
  </table>
  
  <!-- Main Content -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; padding: 30px 25px;">
    <tr>
      <td>
        <p style="margin: 0 0 20px 0; font-size: 16px;">${greeting}</p>
        
        <p style="margin: 0 0 20px 0;">A few days ago, you completed The Leader's Row <strong>Strategic Benchmark Assessment</strong> and received your Career Intelligence Report.</p>
        
        <!-- Reminder Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #B8860B;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Assessment Result</p>
              <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold; color: #1a2332;">${currentLevel} Product Manager</p>
              <p style="margin: 5px 0 0 0; color: #B8860B; font-weight: bold;">Readiness Score: ${Math.round(overallScore)}/100</p>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 25px 0;">We'd love to hear from you:</p>
        
        <!-- Question 1 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 8px; margin-bottom: 15px;">
          <tr>
            <td style="padding: 20px;">
              <h3 style="color: #166534; font-size: 14px; margin: 0 0 10px 0;">🎯 Was Your Report Accurate?</h3>
              <p style="margin: 0; color: #4a5568; font-size: 14px;">Did the insights resonate with where you are in your career? What surprised you the most?</p>
              <p style="margin: 15px 0 0 0; font-size: 13px; color: #6b7280;"><em>Simply reply to this email with your thoughts—we read every response.</em></p>
            </td>
          </tr>
        </table>
        
        <!-- Question 2 -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #fffbf0; border-radius: 8px; margin-bottom: 25px; border: 1px dashed #B8860B;">
          <tr>
            <td style="padding: 20px;">
              <h3 style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">⭐ Want to Be Featured as a Success Story?</h3>
              <p style="margin: 0; color: #4a5568; font-size: 14px;">We're looking for ambitious product leaders to feature in our upcoming case studies and testimonials.</p>
              <p style="margin: 15px 0 0 0; font-size: 13px; color: #6b7280;">If you'd like to share your career journey and how The Leader's Row has helped you think differently about your path, <strong>reply with "I'm interested"</strong> and we'll follow up.</p>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your feedback helps us improve the assessment for thousands of product managers.</p>
        
        <p style="margin: 25px 0 0 0;">Thank you for being part of The Leader's Row community.</p>
        
        <p style="margin: 20px 0 0 0;">
          Best,<br>
          <strong>The Leader's Row Team</strong>
        </p>
      </td>
    </tr>
  </table>
  
  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px; text-align: center;">
    <tr>
      <td>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© The Leader's Row</p>
        <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">
          <a href="${baseUrl}/contact" style="color: #9ca3af;">Contact Us</a>
        </p>
      </td>
    </tr>
  </table>
  
</body>
</html>
      `,
    });

    console.log("Testimonial request email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-testimonial-request function:", error);
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