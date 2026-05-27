
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server missing config: SUPABASE_URL or SERVICE_ROLE_KEY" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Auth check
    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    // Verify JWT cryptographically using Supabase auth
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!anonKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
    const userId = userData?.user?.id;
    if (userError || !userId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: jsonHeaders,
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
      console.error('delete-user update companies error', updateError);
      return new Response(
        JSON.stringify({ error: "Unable to delete account" }),
        { status: 500, headers: jsonHeaders }
      );
    }
    
    // 2. Now delete the user
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      console.error('delete-user deleteUser error', error);
      return new Response(
        JSON.stringify({ error: "Unable to delete account" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error('delete-user error', err);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
