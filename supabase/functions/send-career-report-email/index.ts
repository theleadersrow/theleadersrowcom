import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportEmailRequest {
  email: string;
  firstName?: string;
  currentLevel: string;
  overallScore: number;
  blockerArchetype?: string;
  blockerDescription?: string;
  marketReadinessScore?: string;
  thirtyDayActions?: string[];
  topStrength?: string;
  topGap?: string;
}

const dimensionLabels: Record<string, string> = {
  strategy: "Strategic Thinking",
  execution: "Execution Excellence",
  influence: "Influence & Persuasion",
  narrative: "Storytelling & Narrative",
  data: "Data-Driven Decision Making",
  leadership: "Leadership Presence",
  ambiguity: "Navigating Ambiguity",
  business_ownership: "Business Ownership",
  visibility: "Visibility & Brand",
  customer_empathy: "Customer Empathy",
  prioritization: "Prioritization",
  technical_fluency: "Technical Fluency",
  stakeholder_mgmt: "Stakeholder Management",
  product_sense: "Product Sense",
  collaboration: "Cross-functional Collaboration",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-career-report-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      firstName,
      currentLevel, 
      overallScore,
      blockerArchetype,
      blockerDescription,
      marketReadinessScore,
      thirtyDayActions,
      topStrength,
      topGap
    }: ReportEmailRequest = await req.json();
    
    console.log("Sending career report email to:", email);

    const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
    const strengthLabel = topStrength ? (dimensionLabels[topStrength] || topStrength) : "Not determined";
    const gapLabel = topGap ? (dimensionLabels[topGap] || topGap) : "Not determined";

    // Build actions HTML
    let actionsHtml = "";
    if (thirtyDayActions && thirtyDayActions.length > 0) {
      actionsHtml = thirtyDayActions.map((action, i) => 
        `<tr>
          <td style="padding: 12px 15px; background: ${i % 2 === 0 ? '#f8f9fa' : '#ffffff'}; border-left: 3px solid #B8860B;">
            <strong style="color: #B8860B;">${i + 1}.</strong> ${action}
          </td>
        </tr>`
      ).join("");
    }

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <hello@theleadersrow.com>",
      reply_to: "theleadersrow@gmail.com",
      to: [email],
      subject: `Your Career Intelligence Report — ${currentLevel} PM`,
      text: `${greeting}

Your Strategic Benchmark Assessment is complete.

Here's a snapshot of your Career Intelligence Report:

YOUR LEVEL: ${currentLevel} Product Manager
READINESS SCORE: ${Math.round(overallScore)}/100
TOP STRENGTH: ${strengthLabel}
PRIORITY GAP: ${gapLabel}
${blockerArchetype ? `BLOCKER PATTERN: ${blockerArchetype}` : ''}

${marketReadinessScore ? `MARKET READINESS: ${marketReadinessScore}` : ''}

${blockerArchetype && blockerDescription ? `
ABOUT YOUR BLOCKER PATTERN:
${blockerDescription}
` : ''}

${thirtyDayActions && thirtyDayActions.length > 0 ? `
YOUR 30-DAY ACTION PLAN:
${thirtyDayActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
` : ''}

---

This is a teaser of your full report. To unlock your complete Career Intelligence Report with:
- Detailed skill analysis across all dimensions
- Full 90-day Leadership Lift growth plan
- Personalized program recommendations

View your full report: https://theleadersrow.com/career-report

Ready to accelerate your career? The 200K Method is an 8-week program designed to help ambitious PMs break into senior roles with clarity and confidence.

Learn more: https://theleadersrow.com/200k-method

Questions? Reply to this email anytime.

Best,
The Leader's Row Team
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
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a2332 0%, #2d3748 100%); padding: 30px 20px;">
    <tr>
      <td align="center">
        <h1 style="color: #B8860B; font-size: 24px; margin: 0; font-weight: 400; letter-spacing: 1px;">THE LEADER'S ROW</h1>
        <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">Career Intelligence Report</p>
      </td>
    </tr>
  </table>
  
  <!-- Main Content -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; padding: 30px 25px;">
    <tr>
      <td>
        <p style="margin: 0 0 20px 0;">${greeting}</p>
        
        <p style="margin: 0 0 25px 0;">Your <strong>Strategic Benchmark Assessment</strong> is complete. Here's a snapshot of what we discovered about your product leadership profile.</p>
        
        <!-- Score Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a2332 0%, #2d3748 100%); border-radius: 12px; margin-bottom: 25px;">
          <tr>
            <td style="padding: 25px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 15px;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Your Level</p>
                    <p style="color: #B8860B; font-size: 20px; margin: 0; font-weight: bold;">${currentLevel} PM</p>
                  </td>
                  <td width="50%" style="padding-left: 15px; border-left: 1px solid rgba(255,255,255,0.2);">
                    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Readiness Score</p>
                    <p style="color: #ffffff; font-size: 28px; margin: 0; font-weight: bold;">${Math.round(overallScore)}<span style="font-size: 16px; opacity: 0.7;">/100</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Quick Stats -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
          <tr>
            <td width="50%" style="padding: 15px; background: #f0fdf4; border-radius: 8px 0 0 8px;">
              <p style="color: #166534; font-size: 11px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Top Strength</p>
              <p style="color: #166534; font-size: 14px; margin: 0; font-weight: bold;">${strengthLabel}</p>
            </td>
            <td width="50%" style="padding: 15px; background: #fffbeb; border-radius: 0 8px 8px 0;">
              <p style="color: #92400e; font-size: 11px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Priority Gap</p>
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: bold;">${gapLabel}</p>
            </td>
          </tr>
        </table>
        
        ${blockerArchetype ? `
        <!-- Blocker Pattern -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf5ff; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #9333ea;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #9333ea; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Your Blocker Pattern</p>
              <p style="color: #1a2332; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">${blockerArchetype}</p>
              <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">${blockerDescription || ''}</p>
            </td>
          </tr>
        </table>
        ` : ''}
        
        ${marketReadinessScore ? `
        <!-- Market Readiness -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10b981;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #10b981; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Market Readiness</p>
              <p style="color: #1a2332; font-size: 14px; margin: 0; line-height: 1.6;">${marketReadinessScore}</p>
            </td>
          </tr>
        </table>
        ` : ''}
        
        ${thirtyDayActions && thirtyDayActions.length > 0 ? `
        <!-- 30-Day Actions -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
          <tr>
            <td>
              <p style="color: #1a2332; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">Your 30-Day Action Plan</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${actionsHtml}
              </table>
            </td>
          </tr>
        </table>
        ` : ''}
        
        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #fffbf0; border-radius: 8px; border: 1px dashed #B8860B;">
          <tr>
            <td style="padding: 25px; text-align: center;">
              <p style="color: #1a2332; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">This is just a teaser.</p>
              <p style="color: #4a5568; font-size: 14px; margin: 0 0 20px 0;">Your full Career Intelligence Report includes detailed skill analysis, a complete 90-day growth plan, and personalized recommendations.</p>
              <a href="https://theleadersrow.com/career-report" style="display: inline-block; background: #B8860B; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px;">View Full Report →</a>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 25px; text-align: center;">
    <tr>
      <td>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">Ready to accelerate your career?</p>
        <a href="https://theleadersrow.com/200k-method" style="color: #B8860B; font-size: 14px;">Learn about the 200K Method →</a>
        <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">Questions? Reply to this email anytime.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">© The Leader's Row</p>
      </td>
    </tr>
  </table>
  
</body>
</html>
      `,
    });

    console.log("Career report email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-career-report-email function:", error);
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
