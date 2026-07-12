import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  environment: z.enum(["sandbox", "live"]),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return json({ error: "Invalid environment" }, 400);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const user = userData.user;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.company_id) return json({ error: "No company" }, 400);

    const { data: role, error: roleError } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("company_id", profile.company_id)
      .eq("role", "administrator")
      .maybeSingle();
    if (roleError) throw roleError;
    if (!role) return json({ error: "Administrator access required" }, 403);

    const expiresAt = new Date(Date.now() + 2 * 60 * 60_000).toISOString();
    const { data: authorization, error: authorizationError } = await admin
      .from("billing_checkout_authorizations")
      .insert({
        company_id: profile.company_id,
        user_id: user.id,
        environment: parsed.data.environment,
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (authorizationError) throw authorizationError;

    return json({
      checkoutAuthorizationId: authorization.id,
      email: user.email ?? null,
      expiresAt,
    });
  } catch (error) {
    console.error("create-checkout-context error", error);
    return json({ error: "Could not start checkout" }, 500);
  }
});
