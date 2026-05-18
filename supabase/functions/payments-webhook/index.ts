import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }
  return _supabase;
}

// Map Paddle external price IDs back to our tier + interval
function parsePriceId(priceId: string): { tier: 'starter' | 'pro' | 'business'; interval: 'month' | 'year' } | null {
  const m = priceId.match(/^(starter|pro|business)_(monthly|yearly)$/);
  if (!m) return null;
  return {
    tier: m[1] as 'starter' | 'pro' | 'business',
    interval: m[2] === 'monthly' ? 'month' : 'year',
  };
}

const INCLUDED_SEATS: Record<string, number> = { starter: 2, pro: 4, business: 4 };

async function handleSubscriptionCreatedOrUpdated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, scheduledChange, customData } = data;
  const companyId = customData?.companyId;
  if (!companyId) {
    console.warn('Subscription event missing customData.companyId', id);
    return;
  }
  const item = items?.[0];
  const priceExternal = item?.price?.importMeta?.externalId;
  const productExternal = item?.product?.importMeta?.externalId;
  if (!priceExternal || !productExternal) {
    console.warn('Skipping subscription: missing importMeta.externalId', { id });
    return;
  }
  const parsed = parsePriceId(priceExternal);
  if (!parsed) {
    console.warn('Unrecognized price id', priceExternal);
    return;
  }

  const row = {
    company_id: companyId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    paddle_product_id: productExternal,
    paddle_price_id: priceExternal,
    tier: parsed.tier,
    billing_interval: parsed.interval,
    status,
    included_seats: INCLUDED_SEATS[parsed.tier] ?? 2,
    trial_ends_at: status === 'trialing' ? currentBillingPeriod?.endsAt : null,
    current_period_end: currentBillingPeriod?.endsAt ?? null,
    cancel_at_period_end: scheduledChange?.action === 'cancel',
    environment: env,
    updated_at: new Date().toISOString(),
  };

  await getSupabase()
    .from('subscriptions')
    .upsert(row, { onConflict: 'company_id' });
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase()
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await handleSubscriptionCreatedOrUpdated(event.data, env);
        break;
      case EventName.SubscriptionCanceled:
        await handleSubscriptionCanceled(event.data, env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});