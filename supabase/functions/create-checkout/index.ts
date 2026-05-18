import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const tier: "starter" | "pro" | "business" = body.tier;
    const interval: "month" | "year" = body.interval ?? "month";
    if (!["starter", "pro", "business"].includes(tier)) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get user's company
    const { data: profile } = await userClient
      .from("profiles")
      .select("company_id, email, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.company_id) {
      return new Response(JSON.stringify({ error: "No company" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" });

    // Look up or create Stripe customer (by email)
    const customerEmail = profile.email ?? user.email!;
    const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId = existingCustomers.data[0]?.id;
    if (!customerId) {
      const c = await stripe.customers.create({
        email: customerEmail,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || undefined,
        metadata: { company_id: profile.company_id, user_id: user.id },
      });
      customerId = c.id;
    }

    const basePrice = await stripe.prices.list({ lookup_keys: [`${tier}_base_${interval}`], active: true, limit: 1 });
    if (!basePrice.data[0]) {
      return new Response(JSON.stringify({ error: "Prices not configured. Run stripe-bootstrap first." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const origin = req.headers.get("origin") ?? "https://maintenease.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: basePrice.data[0].id, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { company_id: profile.company_id, tier, interval },
      },
      payment_method_collection: "always",
      success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      metadata: { company_id: profile.company_id, tier, interval },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});