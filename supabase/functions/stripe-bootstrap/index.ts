import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-time: creates products & prices in Stripe and returns the price ID map.
// Idempotent via lookup_keys.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" });

    const TIERS = [
      { tier: "starter", name: "MaintenEase Starter", monthly: 2900, yearly: 29000, seatMonthly: 1000, seatYearly: 10000, includedSeats: 2 },
      { tier: "pro", name: "MaintenEase Pro", monthly: 7900, yearly: 79000, seatMonthly: 1200, seatYearly: 12000, includedSeats: 4 },
      { tier: "business", name: "MaintenEase Business", monthly: 19900, yearly: 199000, seatMonthly: 1500, seatYearly: 15000, includedSeats: 4 },
    ];

    const result: Record<string, Record<string, string>> = {};

    for (const t of TIERS) {
      // Find or create product
      const existingProducts = await stripe.products.search({ query: `metadata['tier']:'${t.tier}'` });
      let product = existingProducts.data[0];
      if (!product) {
        product = await stripe.products.create({
          name: t.name,
          metadata: { tier: t.tier, included_seats: String(t.includedSeats) },
        });
      }

      const ensurePrice = async (lookupKey: string, amount: number, interval: "month" | "year") => {
        const found = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
        if (found.data[0]) return found.data[0].id;
        const created = await stripe.prices.create({
          product: product!.id,
          unit_amount: amount,
          currency: "usd",
          recurring: { interval },
          lookup_key: lookupKey,
          transfer_lookup_key: true,
        });
        return created.id;
      };

      result[t.tier] = {
        base_month: await ensurePrice(`${t.tier}_base_month`, t.monthly, "month"),
        base_year: await ensurePrice(`${t.tier}_base_year`, t.yearly, "year"),
        seat_month: await ensurePrice(`${t.tier}_seat_month`, t.seatMonthly, "month"),
        seat_year: await ensurePrice(`${t.tier}_seat_year`, t.seatYearly, "year"),
      };
    }

    return new Response(JSON.stringify({ ok: true, prices: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stripe-bootstrap error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});