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
          "5": "Kind of help looking for",
          "6": "Commitment level",
          "7": "Type of growth preferred",
        };
        return `<li><strong>${questionLabels[questionNum] || `Question ${questionNum}`}:</strong> ${answer}</li>`;
      })
      .join("");

    const baseUrl = "https://kdzwxxnwhmofznbglopk.lovableproject.com";

    // Determine which program is recommended and build personalized reasoning
    const is200KMethod = result.link.includes("200k-method") || result.link.includes("entry-to-faang");
    const isWeeklyEdge = result.link.includes("weekly-edge");
    const isBoth = result.title.toLowerCase().includes("both") || result.title.toLowerCase().includes("combination");

    // Build personalized "Why This Program" section based on answers
    const buildWhySection = () => {
      const reasons: string[] = [];
      
      // Analyze answers for personalized reasoning
      const challenge = answers["1"] || "";
      const skills = answers["2"] || "";
      const tenure = answers["3"] || "";
      const blocker = answers["4"] || "";
      const helpType = answers["5"] || "";
      const commitment = answers["6"] || "";
      const growthPref = answers["7"] || "";

      if (is200KMethod || isBoth) {
        if (challenge.toLowerCase().includes("noticed") || challenge.toLowerCase().includes("leadership")) {
          reasons.push("You mentioned wanting to get noticed for leadership roles — the 200K Method's personal branding and visibility modules are designed exactly for this.");
        }
        if (challenge.toLowerCase().includes("promoted") || blocker.toLowerCase().includes("visibility")) {
          reasons.push("Since visibility and recognition are key blockers for you, the 200K Method focuses heavily on building your executive presence and strategic positioning.");
        }
        if (skills.toLowerCase().includes("communication") || skills.toLowerCase().includes("storytelling")) {
          reasons.push("Your interest in strategic communication aligns perfectly with our executive presence and stakeholder management training.");
        }
        if (skills.toLowerCase().includes("negotiation") || skills.toLowerCase().includes("compensation")) {
          reasons.push("The 200K Method includes dedicated negotiation modules to help you command the compensation you deserve.");
        }
        if (commitment.toLowerCase().includes("all in") || commitment.toLowerCase().includes("committed")) {
          reasons.push("Your full commitment level is exactly what the 200K Method requires — it's an intensive 8-week transformation.");
        }
        if (tenure.toLowerCase().includes("less than 1") || tenure.toLowerCase().includes("1-2")) {
          reasons.push("Since you're looking to accelerate quickly, the structured 8-week format will give you rapid, measurable results.");
        }
        if (helpType.toLowerCase().includes("coaching") || helpType.toLowerCase().includes("feedback")) {
          reasons.push("You'll get live coaching sessions, personalized feedback, and hot-seat opportunities throughout the program.");
        }
      }

      if (isWeeklyEdge || isBoth) {
        if (commitment.toLowerCase().includes("weekly") || commitment.toLowerCase().includes("few hours")) {
          reasons.push("Your preference for weekly learning fits perfectly with Weekly Edge's 60-minute live sessions.");
        }
        if (growthPref.toLowerCase().includes("ongoing") || growthPref.toLowerCase().includes("weekly")) {
          reasons.push("Weekly Edge provides the continuous skill-building you're looking for to grow consistently over time.");
        }
        if (skills.toLowerCase().includes("influence") || skills.toLowerCase().includes("leadership")) {
          reasons.push("Each week focuses on one high-leverage skill — influence, communication, leadership — that compounds your growth.");
        }
        if (helpType.toLowerCase().includes("community") || helpType.toLowerCase().includes("support")) {
          reasons.push("You'll be part of a supportive community of ambitious professionals pushing each other to rise.");
        }
      }

      // Add default reasons if none matched
      if (reasons.length === 0) {
        if (is200KMethod) {
          reasons.push("Based on your career goals, the 200K Method's intensive approach will help you make a significant leap forward.");
          reasons.push("The program covers personal branding, interview mastery, and negotiation — essential for senior roles.");
        } else if (isWeeklyEdge) {
          reasons.push("Weekly Edge fits professionals who want consistent growth without overwhelming their schedule.");
          reasons.push("You'll build career assets week by week that compound into lasting leadership skills.");
        }
      }

      return reasons;
    };

    const whyReasons = buildWhySection();

    // Build program details section
    const getProgramDetails = () => {
      if (is200KMethod) {
        return {
          name: "200K Method",
          tagline: "The Product Leader's Recalibration",
          duration: "8-Week Intensive Program",
          format: "Live weekly sessions (Thursdays 7-9pm CT)",
          highlights: [
            "Personal leadership brand development",
            "Elite resume & LinkedIn optimization",
            "Advanced PM interview frameworks",
            "Executive presence & communication",
            "Negotiation mastery for $200K+ roles",
            "Private community & accountability support"
          ],
          investment: "$2,000"
        };
      } else if (isWeeklyEdge) {
        return {
          name: "Weekly Edge",
          tagline: "Grow Every Week. Lead Every Day.",
          duration: "Ongoing Weekly Membership",
          format: "60-min live sessions + 30-min Q&A",
          highlights: [
            "One high-leverage skill each week",
            "Action-ready worksheets & templates",
            "Live coaching & feedback",
            "Community of ambitious professionals",
            "Flexible, cancel anytime"
          ],
          investment: "Monthly membership"
        };
      }
      return null;
    };

    const programDetails = getProgramDetails();

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
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

            ${programDetails ? `
            <!-- Recommended Program Section -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 25px; border-radius: 12px; margin: 25px 0; color: #f8f7f4;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="color: #c9a227; margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Recommended For You</p>
                <h3 style="color: #f8f7f4; margin: 8px 0 4px 0; font-size: 22px;">${programDetails.name}</h3>
                <p style="color: #c9a227; margin: 0; font-style: italic;">${programDetails.tagline}</p>
              </div>
              
              <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; font-size: 14px;"><strong style="color: #c9a227;">Duration:</strong> ${programDetails.duration}</p>
                <p style="margin: 0; font-size: 14px;"><strong style="color: #c9a227;">Format:</strong> ${programDetails.format}</p>
              </div>
              
              <p style="color: #c9a227; font-size: 14px; margin-bottom: 10px; font-weight: 600;">What You'll Get:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                ${programDetails.highlights.map(h => `<li style="margin-bottom: 6px;">${h}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <!-- Why This Program Section -->
            <div style="background-color: #f8f7f4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #c9a227;">
              <h3 style="margin-top: 0; color: #1a1a2e; font-size: 18px;">🎯 Why This Is Perfect For You</h3>
              <p style="color: #4a4a4a; font-size: 15px; margin-bottom: 15px;">Based on your responses, here's why we recommend this path:</p>
              <ul style="color: #4a4a4a; padding-left: 20px; margin-bottom: 0;">
                ${whyReasons.map(reason => `<li style="margin-bottom: 10px;">${reason}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${baseUrl}${result.link}" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1a1a2e; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);">
                ${result.cta}
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <!-- Your Answers Summary -->
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #1a1a2e; font-size: 16px;">📋 Your Assessment Summary</h3>
              <ul style="color: #4a4a4a; padding-left: 20px; margin-bottom: 0; font-size: 14px;">
                ${answersSummary}
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <h3 style="color: #1a1a2e; font-size: 18px;">What's Next?</h3>
            <p style="color: #4a4a4a;">
              Ready to take the next step? Click the button above to learn more about ${programDetails?.name || 'your recommended program'} and start your transformation.
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
