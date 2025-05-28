
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  userId: string;
  notificationType: string;
  referenceId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key exists
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      throw new Error("Email service not configured - missing API key");
    }

    console.log("RESEND_API_KEY found, initializing Resend client");
    const resend = new Resend(apiKey);

    const { to, subject, body, userId, notificationType, referenceId } = await req.json() as EmailNotificationRequest;

    if (!to || !subject || !body || !userId) {
      throw new Error("Missing required fields: to, subject, body, userId");
    }

    console.log("Sending email to:", to, "Subject:", subject);

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "MaintenEase <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: body,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending email:", error);
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
