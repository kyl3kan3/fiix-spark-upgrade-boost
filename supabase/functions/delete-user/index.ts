
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server missing config: SUPABASE_URL or SERVICE_ROLE_KEY" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Auth check
    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get user ID from JWT
    const userInfo = parseJwt(jwt);
    const userId = userInfo?.sub;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Use service role to update foreign key references first, then delete the user
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    
    // 1. Update companies table to set created_by to null where it references this user
    const { error: updateError } = await adminClient
      .from("companies")
      .update({ created_by: null })
      .eq("created_by", userId);
      
    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Unable to update company references: " + updateError.message }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    // 2. Now delete the user
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Unable to delete account: " + error.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error: " + err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Simple JWT parsing utils (since atob is available in Deno)
function parseJwt(token: string): any {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
