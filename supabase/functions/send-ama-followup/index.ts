import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the last AMA event date (first Friday of this month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Find the first Friday of this month
    let eventDate = new Date(currentYear, currentMonth, 1, 12, 0, 0);
    while (eventDate.getDay() !== 5) {
      eventDate.setDate(eventDate.getDate() + 1);
    }

    // Check if event was approximately 2 hours ago (within 1 hour window for the cron)
    const hoursSinceEvent = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
    
    console.log(`Hours since last AMA event: ${hoursSinceEvent}`);
    console.log(`Last AMA event date: ${eventDate.toISOString()}`);

    // Only send follow-up if event was 1-3 hours ago
    if (hoursSinceEvent < 1 || hoursSinceEvent > 3) {
      console.log("Not within follow-up window, skipping");
      return new Response(
        JSON.stringify({ message: "Not within follow-up window", hoursSinceEvent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all AMA registrations that received zoom link (attended or were invited)
    const { data: registrations, error: fetchError } = await supabase
      .from("beta_event_registrations")
      .select("*")
      .eq("tool_type", "ama_event")
      .eq("status", "registered")
      .eq("zoom_link_sent", true);

    if (fetchError) {
      console.error("Error fetching registrations:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${registrations?.length || 0} attendees to follow up with`);

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No attendees to follow up" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventDateFormatted = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let successCount = 0;
    let errorCount = 0;

    for (const registration of registrations) {
      const feedbackFormUrl = `https://rimocareers.com/ama-feedback?email=${encodeURIComponent(registration.email)}&name=${encodeURIComponent(registration.full_name || '')}`;
      
      try {
        await resend.emails.send({
          from: "RIMO <events@rimocareers.com>",
          to: [registration.email],
          subject: "Thank You for Joining Today's AMA! 🙌 Your Feedback Matters",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 10px;">Thank You for Joining! 🎉</h1>
              </div>
              
              <p>Hi ${registration.full_name},</p>
              
              <p>Thank you for being part of today's <strong>Monthly Career Acceleration AMA</strong> on ${eventDateFormatted}!</p>
              
              <p>We hope you found the session valuable and got answers to your most pressing career questions.</p>
              
              <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1a1a1a;">📝 We'd Love Your Feedback</h2>
                <p style="margin: 0 0 15px 0;">Your feedback helps us make these sessions even better. It only takes 2 minutes!</p>
                <a href="${feedbackFormUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Share Your Feedback</a>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; color: white;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px;">🗓️ Mark Your Calendar</h2>
                <p style="margin: 0;">The next AMA session is on the <strong>first Friday of next month</strong> at 12:00 PM EST. We'll send you a reminder!</p>
              </div>
              
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0;">
                <h3 style="margin: 0 0 10px 0; color: #166534;">💡 Quick Actions</h3>
                <ul style="margin: 0; padding-left: 20px; color: #166534;">
                  <li>Review your notes from today's session</li>
                  <li>Take one action on the advice you received</li>
                  <li>Connect with fellow attendees on LinkedIn</li>
                  <li>Prepare questions for next month's session</li>
                </ul>
              </div>
              
              <p>Have questions or need 1:1 guidance? Explore our <a href="https://rimocareers.com/career-advisor" style="color: #667eea;">Career Advisor</a> for personalized coaching.</p>
              
              <p style="margin-top: 30px;">
                Until next time,<br>
                <strong>The RIMO Team</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                You're receiving this because you attended the RIMO Monthly AMA.<br>
                <a href="mailto:support@rimocareers.com" style="color: #6b7280;">Contact Support</a>
              </p>
            </body>
            </html>
          `,
        });

        // Reset zoom_link_sent for next month
        await supabase
          .from("beta_event_registrations")
          .update({ zoom_link_sent: false })
          .eq("id", registration.id);

        successCount++;
        console.log(`Follow-up sent to ${registration.email}`);
      } catch (emailError) {
        console.error(`Error sending follow-up to ${registration.email}:`, emailError);
        errorCount++;
      }
    }

    console.log(`Follow-up summary: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Follow-ups processed",
        sent: successCount,
        failed: errorCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-ama-followup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
