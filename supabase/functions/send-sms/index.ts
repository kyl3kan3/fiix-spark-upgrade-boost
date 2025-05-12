
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Twilio } from "npm:twilio@4.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SmsNotificationRequest {
  to: string;
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
    const { to, body, userId, notificationType, referenceId } = await req.json() as SmsNotificationRequest;

    if (!to || !body || !userId) {
      throw new Error("Missing required fields");
    }

    // Initialize Twilio client
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error("Missing Twilio credentials");
    }

    const client = new Twilio(accountSid, authToken);

    // Send SMS
    const message = await client.messages.create({
      body: body,
      from: twilioPhone,
      to: to
    });

    console.log("SMS sent successfully:", message.sid);

    return new Response(
      JSON.stringify({ success: true, messageId: message.sid }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending SMS:", error);
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
