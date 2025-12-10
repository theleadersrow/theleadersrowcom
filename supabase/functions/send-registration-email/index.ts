import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  occupation: string;
  program: string;
}

const getProgramName = (program: string): string => {
  switch (program) {
    case "200k-method":
      return "200K Method ($2,000)";
    case "weekly-edge":
      return "Weekly Edge ($100/month)";
    default:
      return program;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-registration-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, phone, address, city, state, country, zipcode, occupation, program }: RegistrationEmailRequest = await req.json();
    
    console.log("Received registration submission:", { fullName, email, program });

    const programName = getProgramName(program);
    const fullAddress = `${address}, ${city}, ${state} ${zipcode}, ${country}`;

    // Send notification email to The Leader's Row
    const notificationResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      to: ["theleadersrow@gmail.com"],
      subject: `New Registration: ${fullName} - ${programName}`,
      html: `
        <h2>New Program Registration</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Full Name</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Address</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${fullAddress}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Occupation</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${occupation}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Program</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${programName}</td>
          </tr>
        </table>
        <hr style="margin: 20px 0;">
        <p><em>Sent from The Leader's Row website registration form</em></p>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation email to the registrant
    const confirmationResponse = await resend.emails.send({
      from: "The Leader's Row <connect@theleadersrow.com>",
      to: [email],
      subject: "Registration Received - The Leader's Row",
      html: `
        <h1>Thank you for registering, ${fullName}!</h1>
        <p>We have received your registration for <strong>${programName}</strong>.</p>
        <p>A member of our team will contact you within 24–48 hours to complete your registration and guide you through next steps.</p>
        <h3>Your Registration Details:</h3>
        <ul>
          <li><strong>Program:</strong> ${programName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>
        <p>If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:connect@theleadersrow.com">connect@theleadersrow.com</a>.</p>
        <p>Best regards,<br>The Leader's Row Team</p>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notificationResponse,
        confirmation: confirmationResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-registration-email function:", error);
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
