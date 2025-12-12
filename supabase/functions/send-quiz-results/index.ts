import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 5,
  windowMinutes: 60,
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

// Allowed link paths to prevent open redirect
const ALLOWED_LINK_PATHS = ["/200k-method", "/weekly-edge", "/entry-to-faang", "/book-call"];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, "send-quiz-results");
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

    const { email, answers, result }: QuizResultsRequest = await req.json();
    
    // Input validation
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!answers || typeof answers !== "object") {
      return new Response(JSON.stringify({ error: "Invalid answers" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!result || typeof result !== "object" || !result.title || !result.link) {
      return new Response(JSON.stringify({ error: "Invalid result" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Validate result link to prevent open redirect
    const linkPath = result.link.startsWith("/") ? result.link : `/${result.link}`;
    if (!ALLOWED_LINK_PATHS.some(path => linkPath.startsWith(path))) {
      return new Response(JSON.stringify({ error: "Invalid result link" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log("Sending quiz results to:", email);
    console.log("Result recommendation:", result.title);

    // Sanitize result fields
    const safeTitle = sanitize(result.title);
    const safeMessage = sanitize(result.message || "");
    const safeCta = sanitize(result.cta || "Learn More");

    // Build answers summary for email
    const answersSummary = Object.entries(answers)
      .slice(0, 10) // Limit to prevent abuse
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
        const safeAnswer = sanitize(String(answer).slice(0, 500));
        return `<li><strong>${questionLabels[questionNum] || `Question ${questionNum}`}:</strong> ${safeAnswer}</li>`;
      })
      .join("");

    const baseUrl = "https://theleadersrow.com";

    // Determine which program is recommended
    const is200KMethod = result.link.includes("200k-method") || result.link.includes("entry-to-faang");
    const isWeeklyEdge = result.link.includes("weekly-edge");
    const isBoth = result.title.toLowerCase().includes("both") || result.title.toLowerCase().includes("combination");

    // Extract answers for analysis (with defaults)
    const challenge = String(answers["1"] || "").slice(0, 500);
    const skills = String(answers["2"] || "").slice(0, 500);
    const tenure = String(answers["3"] || "").slice(0, 500);
    const blocker = String(answers["4"] || "").slice(0, 500);
    const helpType = String(answers["5"] || "").slice(0, 500);
    const commitment = String(answers["6"] || "").slice(0, 500);
    const growthPref = String(answers["7"] || "").slice(0, 500);

    // Build smart career profile analysis
    const buildCareerProfile = () => {
      const profile: { situation: string; strength: string; gap: string } = {
        situation: "",
        strength: "",
        gap: ""
      };

      // Analyze their situation
      if (tenure.toLowerCase().includes("less than 1")) {
        profile.situation = "You're in the early stages of your current role, which means now is the perfect time to build momentum before patterns settle.";
      } else if (tenure.toLowerCase().includes("1-2")) {
        profile.situation = "You've been in your role long enough to understand the landscape, but you're ready to break through to the next level.";
      } else if (tenure.toLowerCase().includes("3-5") || tenure.toLowerCase().includes("5+")) {
        profile.situation = "You have significant experience, but something has been holding you back from the recognition and advancement you deserve.";
      } else {
        profile.situation = "You're at a pivotal point in your career where the right investment in yourself can create exponential returns.";
      }

      // Identify their strength based on what they want to develop
      if (skills.toLowerCase().includes("communication") || skills.toLowerCase().includes("storytelling")) {
        profile.strength = "You recognize that communication is the key differentiator for leaders — this awareness alone puts you ahead of most professionals.";
      } else if (skills.toLowerCase().includes("influence") || skills.toLowerCase().includes("stakeholder")) {
        profile.strength = "Your focus on influence and stakeholder management shows strategic thinking about how real career advancement happens.";
      } else if (skills.toLowerCase().includes("brand") || skills.toLowerCase().includes("visibility")) {
        profile.strength = "You understand that visibility and personal branding are essential — not optional — for reaching senior leadership roles.";
      } else if (skills.toLowerCase().includes("negotiation")) {
        profile.strength = "Prioritizing negotiation skills shows you're thinking about the full picture of career success, not just job performance.";
      } else {
        profile.strength = "You're taking proactive steps to develop leadership skills — this growth mindset is exactly what separates rising leaders from those who plateau.";
      }

      // Identify their gap/blocker
      if (blocker.toLowerCase().includes("visibility") || blocker.toLowerCase().includes("recognition")) {
        profile.gap = "Your work speaks for itself, but the right people aren't hearing about it. This is a positioning problem, not a performance problem.";
      } else if (blocker.toLowerCase().includes("confidence") || blocker.toLowerCase().includes("imposter")) {
        profile.gap = "The gap between your capabilities and your confidence is costing you opportunities. This is fixable with the right frameworks.";
      } else if (blocker.toLowerCase().includes("network") || blocker.toLowerCase().includes("sponsor")) {
        profile.gap = "Without strategic relationships and sponsors advocating for you, even exceptional work goes unnoticed at promotion time.";
      } else if (blocker.toLowerCase().includes("clarity") || blocker.toLowerCase().includes("direction")) {
        profile.gap = "Without a clear target and strategy, your efforts are scattered. Focus and clarity will accelerate everything.";
      } else {
        profile.gap = "There's likely a gap between the value you create and how that value is perceived by decision-makers.";
      }

      return profile;
    };

    // Build "How This Program Helps" section
    const buildHowItHelps = () => {
      const helps: { title: string; description: string }[] = [];

      if (is200KMethod || isBoth) {
        if (challenge.toLowerCase().includes("noticed") || blocker.toLowerCase().includes("visibility")) {
          helps.push({
            title: "Build Your Leadership Brand",
            description: "We'll help you craft a compelling professional narrative that positions you as a go-to leader, not just a contributor. Your LinkedIn, resume, and how you show up in meetings will all be strategically aligned."
          });
        }
        if (skills.toLowerCase().includes("communication") || skills.toLowerCase().includes("storytelling")) {
          helps.push({
            title: "Master Executive Communication",
            description: "Learn the frameworks senior leaders use to influence decisions, present to executives, and tell stories that drive action. This transforms how stakeholders perceive your strategic value."
          });
        }
        if (skills.toLowerCase().includes("negotiation") || challenge.toLowerCase().includes("compensation")) {
          helps.push({
            title: "Negotiate Like a CEO",
            description: "Our negotiation module teaches you exactly how to advocate for your worth — from salary discussions to scope negotiations. You'll learn to anchor high and defend your position with confidence."
          });
        }
        if (helpType.toLowerCase().includes("coaching") || helpType.toLowerCase().includes("feedback")) {
          helps.push({
            title: "Get Personalized Expert Feedback",
            description: "Weekly live sessions include hot seats, role-play, and direct feedback on your materials and approach. You won't just learn theory — you'll practice and refine with expert guidance."
          });
        }
        if (blocker.toLowerCase().includes("interview") || challenge.toLowerCase().includes("interview")) {
          helps.push({
            title: "Ace Every Interview",
            description: "Master advanced PM interview frameworks from behavioral to product sense to strategy cases. You'll walk into interviews with confidence and a proven system for standout answers."
          });
        }
        if (helps.length < 2) {
          helps.push({
            title: "Accelerate Your Career Timeline",
            description: "The 8-week intensive compresses years of career learning into focused, actionable modules. You'll emerge with a complete toolkit for senior-level positioning and advancement."
          });
        }
      }

      if (isWeeklyEdge || isBoth) {
        helps.push({
          title: "Build Skills That Compound",
          description: "Each week you'll add a new career asset — a skill, framework, or mindset shift that makes you more effective. These compound over time into a formidable leadership presence."
        });
        if (commitment.toLowerCase().includes("weekly") || commitment.toLowerCase().includes("few hours")) {
          helps.push({
            title: "Sustainable, Flexible Growth",
            description: "60-minute weekly sessions fit into your busy schedule while delivering continuous improvement. Small consistent investments create massive long-term results."
          });
        }
        if (helpType.toLowerCase().includes("community")) {
          helps.push({
            title: "Learn Alongside Ambitious Peers",
            description: "You'll be surrounded by driven professionals who push each other to grow. The community accountability and shared learning accelerates everyone's progress."
          });
        }
      }

      return helps;
    };

    // Build program details
    const getProgramDetails = () => {
      if (is200KMethod) {
        return {
          name: "200K Method",
          tagline: "The Product Leader's Recalibration",
          duration: "8-Week Intensive Program",
          format: "Live weekly sessions (Thursdays 7-9pm CT)",
          investment: "$2,000"
        };
      } else if (isWeeklyEdge) {
        return {
          name: "Weekly Edge",
          tagline: "Grow Every Week. Lead Every Day.",
          duration: "Ongoing Weekly Membership",
          format: "60-min live sessions + 30-min Q&A",
          investment: "Monthly membership"
        };
      }
      return null;
    };

    const careerProfile = buildCareerProfile();
    const howItHelps = buildHowItHelps();
    const programDetails = getProgramDetails();

    const emailResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      to: [email],
      subject: `Your Career Assessment Results: ${safeTitle}`,
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
            <p style="color: #c9a227; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 1px;">YOUR CAREER ASSESSMENT RESULTS</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Result Title -->
            <h2 style="color: #c9a227; margin-top: 0; font-size: 24px; text-align: center;">${safeTitle}</h2>
            <p style="font-size: 16px; color: #4a4a4a; margin-bottom: 30px; text-align: center;">
              ${safeMessage}
            </p>

            <!-- Smart Career Profile Section -->
            <div style="background: linear-gradient(135deg, #f8f7f4 0%, #f0efe8 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e8e6df;">
              <h3 style="margin-top: 0; color: #1a1a2e; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">📊</span> Your Career Profile Analysis
              </h3>
              
              <div style="margin-bottom: 18px;">
                <p style="color: #c9a227; font-size: 13px; font-weight: 600; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Where You Are</p>
                <p style="color: #4a4a4a; font-size: 15px; margin: 0;">${sanitize(careerProfile.situation)}</p>
              </div>
              
              <div style="margin-bottom: 18px;">
                <p style="color: #c9a227; font-size: 13px; font-weight: 600; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">What's Working For You</p>
                <p style="color: #4a4a4a; font-size: 15px; margin: 0;">${sanitize(careerProfile.strength)}</p>
              </div>
              
              <div>
                <p style="color: #c9a227; font-size: 13px; font-weight: 600; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">The Gap Holding You Back</p>
                <p style="color: #4a4a4a; font-size: 15px; margin: 0;">${sanitize(careerProfile.gap)}</p>
              </div>
            </div>

            ${programDetails ? `
            <!-- Recommended Program -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 25px; border-radius: 12px; margin: 25px 0; color: #f8f7f4;">
              <div style="text-align: center; margin-bottom: 15px;">
                <p style="color: #c9a227; margin: 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Our Recommendation</p>
                <h3 style="color: #f8f7f4; margin: 8px 0 4px 0; font-size: 24px; font-weight: 700;">${sanitize(programDetails.name)}</h3>
                <p style="color: #c9a227; margin: 0; font-style: italic; font-size: 15px;">${sanitize(programDetails.tagline)}</p>
              </div>
              <div style="display: flex; justify-content: center; gap: 30px; font-size: 13px; opacity: 0.9;">
                <span>📅 ${sanitize(programDetails.duration)}</span>
              </div>
            </div>
            ` : ''}

            <!-- How This Program Helps You Section -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1a1a2e; font-size: 18px; margin-bottom: 20px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🎯</span> How ${programDetails?.name || 'This Program'} Will Help You
              </h3>
              
              ${howItHelps.map((help) => `
                <div style="background-color: #fafafa; padding: 18px 20px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #c9a227;">
                  <h4 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 16px;">${sanitize(help.title)}</h4>
                  <p style="color: #4a4a4a; margin: 0; font-size: 14px; line-height: 1.6;">${sanitize(help.description)}</p>
                </div>
              `).join('')}
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${baseUrl}${linkPath}" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1a1a2e; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(201, 162, 39, 0.35);">
                ${safeCta}
              </a>
              <p style="color: #888; font-size: 13px; margin-top: 12px;">Your next career breakthrough starts with one click.</p>
            </div>

            <!-- Next Steps Section -->
            <div style="background-color: #fafafa; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <h3 style="color: #1a1a2e; font-size: 18px; margin: 0 0 20px 0;">Ready to Take the Next Step?</h3>
              
              <div style="display: block;">
                <a href="${baseUrl}/book-call" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); color: #f8f7f4; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px;">
                  📞 Book a Discovery Call
                </a>
              </div>
              
              <div style="display: block;">
                <a href="${baseUrl}/contact" style="display: inline-block; color: #c9a227; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px;">
                  ✉️ Contact Us
                </a>
              </div>
            </div>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <!-- Your Responses -->
            <details style="margin: 20px 0;">
              <summary style="color: #1a1a2e; font-size: 14px; cursor: pointer; font-weight: 600;">📋 View Your Quiz Responses</summary>
              <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <ul style="color: #666; padding-left: 20px; margin: 0; font-size: 13px;">
                  ${answersSummary}
                </ul>
              </div>
            </details>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #4a4a4a; font-size: 15px;">
              <strong>Questions?</strong> Simply reply to this email or <a href="${baseUrl}/contact" style="color: #c9a227; text-decoration: none; font-weight: 600;">reach out here</a>. We're here to help you succeed.
            </p>
            
            <p style="color: #4a4a4a; margin-bottom: 0;">
              To your success,<br>
              <strong style="color: #1a1a2e;">The Leader's Row Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #888;">
            <p style="margin: 0 0 10px 0; font-size: 12px;">
              <a href="${baseUrl}" style="color: #c9a227; text-decoration: none;">The Leader's Row</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: #aaa;">
              Helping ambitious professionals rise to the top.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Quiz results email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error sending quiz results email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
