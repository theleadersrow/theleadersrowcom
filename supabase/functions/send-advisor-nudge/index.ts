import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface ActionItem {
  task: string;
  priority: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, sessionId, type } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SEND-NUDGE] Sending ${type} nudge to ${email}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch relevant data based on nudge type
    let actionItems: ActionItem[] = [];
    let goals: Goal[] = [];
    let sessionSummary = "";

    if (sessionId) {
      // Get latest summary
      const { data: summaryData } = await supabaseClient
        .from("career_advisor_summaries")
        .select("summary, action_items")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (summaryData) {
        sessionSummary = summaryData.summary;
        actionItems = (summaryData.action_items as ActionItem[]) || [];
      }

      // Get active goals
      const { data: goalsData } = await supabaseClient
        .from("career_advisor_goals")
        .select("id, title, progress, status")
        .eq("session_id", sessionId)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(5);

      goals = (goalsData as Goal[]) || [];
    }

    // Build email content
    const actionItemsHtml = actionItems.length > 0 
      ? `
        <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px;">📋 Your Action Items</h3>
        <ul style="padding-left: 20px; color: #4b5563;">
          ${actionItems.slice(0, 5).map(item => `
            <li style="margin-bottom: 8px;">
              <span style="background: ${item.priority === 'high' ? '#fee2e2' : item.priority === 'medium' ? '#fef3c7' : '#dcfce7'}; 
                     color: ${item.priority === 'high' ? '#dc2626' : item.priority === 'medium' ? '#d97706' : '#16a34a'}; 
                     padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px;">
                ${item.priority.toUpperCase()}
              </span>
              ${item.task}
            </li>
          `).join('')}
        </ul>
      ` : '';

    const goalsHtml = goals.length > 0 
      ? `
        <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px;">🎯 Your Career Goals</h3>
        ${goals.map(goal => `
          <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 500; color: #374151;">${goal.title}</span>
              <span style="color: #7c3aed; font-weight: 600;">${goal.progress}%</span>
            </div>
            <div style="background: #e5e7eb; border-radius: 4px; height: 8px; margin-top: 8px;">
              <div style="background: linear-gradient(to right, #7c3aed, #a78bfa); border-radius: 4px; height: 8px; width: ${goal.progress}%;"></div>
            </div>
          </div>
        `).join('')}
      ` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 18px;">
                  ✨ RIMO Career Advisor
                </div>
              </div>

              <h2 style="color: #111827; margin-bottom: 16px; text-align: center;">
                Your Career Check-In 💪
              </h2>

              <p style="color: #6b7280; line-height: 1.6; text-align: center;">
                Hi there! Just checking in on your career progress. Here's a quick snapshot of where you're at:
              </p>

              ${sessionSummary ? `
                <div style="background: linear-gradient(135deg, #faf5ff, #f0f9ff); border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #7c3aed;">
                  <h3 style="color: #374151; margin-top: 0; margin-bottom: 8px;">💡 Last Session Recap</h3>
                  <p style="color: #4b5563; margin: 0; line-height: 1.5;">${sessionSummary}</p>
                </div>
              ` : ''}

              ${actionItemsHtml}
              ${goalsHtml}

              ${(actionItems.length === 0 && goals.length === 0) ? `
                <div style="background: #f9fafb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                  <p style="color: #6b7280; margin: 0;">
                    Ready to set some career goals? Come back to your Career Advisor and let's create a plan together!
                  </p>
                </div>
              ` : ''}

              <!-- CTA -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://therealleverage.com/career-coach" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Continue Your Session →
                </a>
              </div>

              <!-- Motivational Quote -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-style: italic; margin: 0;">
                  "The only way to do great work is to love what you do." - Steve Jobs
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
              <p>Sent by RIMO Career Advisor</p>
              <p>You're receiving this because you used Career Advisor Pro.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIMO Career Advisor <hello@therealleverage.com>",
        to: [email],
        subject: "🎯 Your Career Progress Check-In",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("[SEND-NUDGE] Resend error:", errorText);
      throw new Error(`Failed to send email: ${resendResponse.status}`);
    }

    console.log(`[SEND-NUDGE] Successfully sent nudge to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Nudge sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[SEND-NUDGE] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
