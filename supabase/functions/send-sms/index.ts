
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Twilio } from "npm:twilio@4.19.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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
    // Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const authUserId = claimsData.claims.sub;

    const { to, body, userId, notificationType, referenceId } = await req.json() as SmsNotificationRequest;

    if (!to || !body || !userId) {
      throw new Error("Missing required fields");
    }
    if (userId !== authUserId) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Restrict `to` to the authenticated user's own phone number to prevent
    // arbitrary outbound SMS abuse.
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey,
      { auth: { persistSession: false } },
    );
    const { data: profile } = await adminClient
      .from("profiles").select("phone_number").eq("id", authUserId).maybeSingle();
    const { data: prefs } = await adminClient
      .from("notification_preferences").select("phone_number").eq("user_id", authUserId).maybeSingle();
    const norm = (s: string | null | undefined) => (s || "").replace(/[^\d+]/g, "");
    const allowed = new Set(
      [(profile as any)?.phone_number, (prefs as any)?.phone_number].filter(Boolean).map(norm),
    );
    if (!allowed.has(norm(to))) {
      return new Response(JSON.stringify({
        success: false,
        error: "Recipient must match the authenticated user's own phone number",
      }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
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
