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

    // Get the next AMA event date (first Friday of next month at 12pm EST)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Find the first Friday of this month or next month
    let eventDate = new Date(currentYear, currentMonth, 1, 12, 0, 0); // 12pm
    
    // Find first Friday
    while (eventDate.getDay() !== 5) {
      eventDate.setDate(eventDate.getDate() + 1);
    }
    
    // If that Friday has passed, move to next month
    if (eventDate < now) {
      eventDate = new Date(currentYear, currentMonth + 1, 1, 12, 0, 0);
      while (eventDate.getDay() !== 5) {
        eventDate.setDate(eventDate.getDate() + 1);
      }
    }

    // Check if event is approximately 24 hours away (within 1 hour window)
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    console.log(`Hours until next AMA event: ${hoursUntilEvent}`);
    console.log(`Next AMA event date: ${eventDate.toISOString()}`);

    if (hoursUntilEvent < 23 || hoursUntilEvent > 25) {
      console.log("Not within 24-hour reminder window, skipping");
      return new Response(
        JSON.stringify({ message: "Not within reminder window", hoursUntilEvent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all AMA registrations that haven't received a reminder
    const { data: registrations, error: fetchError } = await supabase
      .from("beta_event_registrations")
      .select("*")
      .eq("tool_type", "ama_event")
      .eq("status", "registered")
      .is("zoom_link_sent", false);

    if (fetchError) {
      console.error("Error fetching registrations:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${registrations?.length || 0} registrations to remind`);

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No registrations to remind" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const zoomLink = "https://us06web.zoom.us/j/your-ama-meeting-id"; // Replace with actual Zoom link
    const eventDateFormatted = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let successCount = 0;
    let errorCount = 0;

    for (const registration of registrations) {
      try {
        await resend.emails.send({
          from: "RIMO <events@rimocareers.com>",
          to: [registration.email],
          subject: "🎯 Your AMA Session is Tomorrow - Join Link Inside!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 10px;">Your AMA Session is Tomorrow! 🚀</h1>
              </div>
              
              <p>Hi ${registration.full_name},</p>
              
              <p>This is a friendly reminder that the <strong>Monthly Career Acceleration AMA</strong> is happening tomorrow!</p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; color: white;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px;">📅 Event Details</h2>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDateFormatted}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> 12:00 PM EST</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> 60 minutes</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${zoomLink}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Join Zoom Meeting</a>
              </div>
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">💡 Tips to Get the Most Out of the Session:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Prepare 1-2 specific questions about your career situation</li>
                  <li>Join 5 minutes early to ensure your audio/video works</li>
                  <li>Have a notepad ready to capture insights</li>
                  <li>Be ready to engage with other attendees' questions too</li>
                </ul>
              </div>
              
              <p>Can't make it? No worries - we host this session every month on the first Friday. You'll be notified about the next one automatically.</p>
              
              <p>See you tomorrow!</p>
              
              <p style="margin-top: 30px;">
                Best,<br>
                <strong>The RIMO Team</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                You're receiving this because you registered for the RIMO Monthly AMA.<br>
                <a href="mailto:support@rimocareers.com" style="color: #6b7280;">Contact Support</a>
              </p>
            </body>
            </html>
          `,
        });

        // Mark as reminder sent
        await supabase
          .from("beta_event_registrations")
          .update({ zoom_link_sent: true })
          .eq("id", registration.id);

        successCount++;
        console.log(`Reminder sent to ${registration.email}`);
      } catch (emailError) {
        console.error(`Error sending reminder to ${registration.email}:`, emailError);
        errorCount++;
      }
    }

    console.log(`Reminder summary: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Reminders processed",
        sent: successCount,
        failed: errorCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-ama-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
