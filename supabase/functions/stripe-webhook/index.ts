import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function tierFromPriceLookup(lookup: string | null | undefined): "starter" | "pro" | "business" | null {
  if (!lookup) return null;
  if (lookup.startsWith("starter")) return "starter";
  if (lookup.startsWith("pro")) return "pro";
  if (lookup.startsWith("business")) return "business";
  return null;
}
function intervalFromLookup(lookup: string | null | undefined): "month" | "year" {
  return lookup?.endsWith("_year") ? "year" : "month";
}
function includedSeatsFor(tier: string): number {
  return tier === "starter" ? 2 : tier === "pro" ? 4 : 4;
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const companyId = (sub.metadata?.company_id as string) || null;
  if (!companyId) {
    console.warn("subscription missing company_id metadata", sub.id);
    return;
  }

  // Figure out tier/interval from the base price line (lookup_key starts with tier)
  let tier: "starter" | "pro" | "business" = "starter";
  let interval: "month" | "year" = "month";
  let paidSeats = 0;

  for (const item of sub.items.data) {
    const lk = (item.price.lookup_key ?? "") as string;
    const t = tierFromPriceLookup(lk);
    if (!t) continue;
    if (lk.includes("_base_")) {
      tier = t;
      interval = intervalFromLookup(lk);
    } else if (lk.includes("_seat_")) {
      paidSeats = item.quantity ?? 0;
    }
  }

  const row = {
    company_id: companyId,
    tier,
    status: sub.status as any,
    billing_interval: interval,
    included_seats: includedSeatsFor(tier),
    paid_seats: paidSeats,
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
  };

  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "company_id" });
  if (error) console.error("upsert subscription failed", error);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const signature = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (secret && signature) {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
    } else {
      // Allow unsigned events only if webhook secret not yet configured (dev convenience)
      event = JSON.parse(rawBody);
      console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
    }
  } catch (e) {
    console.error("Signature verification failed", e);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          // Carry company_id metadata from checkout to subscription if missing
          if (!sub.metadata?.company_id && session.metadata?.company_id) {
            await stripe.subscriptions.update(sub.id, {
              metadata: { ...sub.metadata, company_id: session.metadata.company_id },
            });
            sub.metadata = { ...sub.metadata, company_id: session.metadata.company_id };
          }
          await upsertFromSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // ignore
        break;
    }
  } catch (e) {
    console.error("webhook handler error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});