
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  token: string;
  title: string;
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
    const jwt = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(jwt);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const authUserId = claimsData.claims.sub;

    const { token, title, body, userId, notificationType, referenceId } = await req.json() as PushNotificationRequest;

    if (!token || !title || !body || !userId) {
      throw new Error("Missing required fields");
    }
    if (userId !== authUserId) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify the FCM token is registered to this user
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: deviceRow } = await admin
      .from("device_tokens")
      .select("id")
      .eq("user_id", authUserId)
      .eq("token", token)
      .maybeSingle();
    if (!deviceRow) {
      return new Response(JSON.stringify({ success: false, error: "Token not registered to this user" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Firebase server key
    const firebaseServerKey = Deno.env.get("FIREBASE_SERVER_KEY");
    if (!firebaseServerKey) {
      throw new Error("Missing Firebase server key");
    }

    // Send push notification using Firebase Cloud Messaging
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${firebaseServerKey}`
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: title,
          body: body,
          icon: "/favicon.ico",
          click_action: "/"
        },
        data: {
          userId: userId,
          type: notificationType,
          referenceId: referenceId || ""
        }
      })
    });

    const result = await response.json();
    console.log("Push notification sent:", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
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
