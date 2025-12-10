import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizResultsRequest {
  email: string;
  answers: Record<string, string>;
  result: {
    title: string;
    message: string;
    cta: string;
    link: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, answers, result }: QuizResultsRequest = await req.json();
    
    console.log("Sending quiz results to:", email);
    console.log("Quiz answers:", answers);
    console.log("Result recommendation:", result.title);

    // Build answers summary for email
    const answersSummary = Object.entries(answers)
      .map(([questionNum, answer]) => {
        const questionLabels: Record<string, string> = {
          "1": "Biggest career challenge",
          "2": "Skills to develop",
          "3": "Time in current role",
          "4": "What's holding you back",
          "5": "Type of growth preferred",
        };
        return `<li><strong>${questionLabels[questionNum] || `Question ${questionNum}`}:</strong> ${answer}</li>`;
      })
      .join("");

    const baseUrl = "https://kdzwxxnwhmofznbglopk.lovableproject.com";

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <onboarding@resend.dev>",
      to: [email],
      subject: `Your Career Assessment Results: ${result.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f7f4;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #f8f7f4; margin: 0; font-size: 28px; font-weight: 600;">The Leader's Row</h1>
            <p style="color: #c9a227; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 1px;">CAREER ASSESSMENT RESULTS</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #c9a227; margin-top: 0; font-size: 24px;">${result.title}</h2>
            
            <p style="font-size: 16px; color: #4a4a4a; margin-bottom: 25px;">
              ${result.message}
            </p>
            
            <div style="background-color: #f8f7f4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #c9a227;">
              <h3 style="margin-top: 0; color: #1a1a2e; font-size: 16px;">Your Assessment Summary:</h3>
              <ul style="color: #4a4a4a; padding-left: 20px; margin-bottom: 0;">
                ${answersSummary}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${baseUrl}${result.link}" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1a1a2e; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);">
                ${result.cta}
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <h3 style="color: #1a1a2e; font-size: 18px;">What's Next?</h3>
            <p style="color: #4a4a4a;">
              Based on your responses, we've identified the perfect path for your career acceleration. 
              Click the button above to learn more about how we can help you achieve your goals.
            </p>
            
            <p style="color: #4a4a4a;">
              Have questions? Simply reply to this email or <a href="${baseUrl}/contact" style="color: #c9a227;">contact us here</a>.
            </p>
            
            <p style="color: #4a4a4a; margin-bottom: 0;">
              To your success,<br>
              <strong>The Leader's Row Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888;">
            <p style="font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} The Leader's Row. All rights reserved.
            </p>
            <p style="font-size: 12px; margin: 10px 0 0 0;">
              <a href="${baseUrl}/privacy" style="color: #888; text-decoration: underline;">Privacy Policy</a> | 
              <a href="${baseUrl}/terms" style="color: #888; text-decoration: underline;">Terms of Service</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending quiz results email:", error);
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
