import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';
import type { Database } from '../../../src/integrations/supabase/types.ts';

let _supabase: SupabaseClient<Database> | null = null;
function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createClient<Database>(
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
type SubscriptionStatus = Database['public']['Enums']['subscription_status'];

function normalizeStatus(status: unknown): SubscriptionStatus {
  const known: SubscriptionStatus[] = [
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete',
  ];
  return typeof status === 'string' && known.includes(status as SubscriptionStatus)
    ? status as SubscriptionStatus
    : 'incomplete';
}

async function resolveTrustedCompanyId(
  subscriptionId: string,
  customData: Record<string, unknown> | null | undefined,
  env: PaddleEnv,
): Promise<string | null> {
  const { data: existing, error: existingError } = await getSupabase()
    .from('subscriptions')
    .select('company_id')
    .eq('paddle_subscription_id', subscriptionId)
    .eq('environment', env)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.company_id) return existing.company_id;

  const authorizationId = customData?.checkoutAuthorizationId;
  if (typeof authorizationId !== 'string') return null;

  const { data: authorization, error: authorizationError } = await getSupabase()
    .from('billing_checkout_authorizations')
    .select('company_id, expires_at, paddle_subscription_id')
    .eq('id', authorizationId)
    .eq('environment', env)
    .maybeSingle();
  if (authorizationError) throw authorizationError;
  if (!authorization) return null;

  if (authorization.paddle_subscription_id) {
    return authorization.paddle_subscription_id === subscriptionId
      ? authorization.company_id
      : null;
  }

  const now = new Date().toISOString();
  if (authorization.expires_at <= now) return null;

  const { data: claimed, error: claimError } = await getSupabase()
    .from('billing_checkout_authorizations')
    .update({ paddle_subscription_id: subscriptionId })
    .eq('id', authorizationId)
    .eq('environment', env)
    .is('paddle_subscription_id', null)
    .gt('expires_at', now)
    .select('company_id')
    .maybeSingle();
  if (claimError) throw claimError;
  if (claimed?.company_id) return claimed.company_id;

  // A concurrent delivery may have claimed the same authorization first.
  const { data: concurrent, error: concurrentError } = await getSupabase()
    .from('billing_checkout_authorizations')
    .select('company_id, paddle_subscription_id')
    .eq('id', authorizationId)
    .eq('environment', env)
    .maybeSingle();
  if (concurrentError) throw concurrentError;
  return concurrent?.paddle_subscription_id === subscriptionId
    ? concurrent.company_id
    : null;
}

async function handleSubscriptionCreatedOrUpdated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, scheduledChange, customData } = data;
  const companyId = await resolveTrustedCompanyId(id, customData, env);
  if (!companyId) {
    console.warn('Ignoring subscription event without a trusted checkout authorization', id);
    return;
  }
  // Find the plan item (tier price) and sum seat add-on quantities separately.
  let planItem: any = null;
  let paidSeats = 0;
  for (const it of items ?? []) {
    const ext = it?.price?.importMeta?.externalId as string | undefined;
    if (!ext) continue;
    if (ext.startsWith('extra_seat')) {
      paidSeats += Number(it.quantity ?? 0);
    } else if (parsePriceId(ext)) {
      planItem = it;
    }
  }
  if (!planItem) {
    console.warn('Skipping subscription: no recognized plan item', { id });
    return;
  }
  const priceExternal = planItem.price.importMeta.externalId as string;
  const productExternal = planItem.product?.importMeta?.externalId as string;
  const parsed = parsePriceId(priceExternal)!;

  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus !== status) {
    console.warn('Mapping unrecognized Paddle subscription status to incomplete', status);
  }

  const row = {
    company_id: companyId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    paddle_product_id: productExternal,
    paddle_price_id: priceExternal,
    tier: parsed.tier,
    billing_interval: parsed.interval,
    status: normalizedStatus,
    included_seats: INCLUDED_SEATS[parsed.tier] ?? 2,
    paid_seats: paidSeats,
    trial_ends_at: normalizedStatus === 'trialing' ? currentBillingPeriod?.endsAt : null,
    current_period_end: currentBillingPeriod?.endsAt ?? null,
    cancel_at_period_end: scheduledChange?.action === 'cancel',
    environment: env,
    updated_at: new Date().toISOString(),
  };

  const { error } = await getSupabase()
    .from('subscriptions')
    .upsert(row, { onConflict: 'company_id' });
  if (error) throw error;
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  const { error } = await getSupabase()
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const requestedEnv = url.searchParams.get('env') || 'sandbox';
  if (requestedEnv !== 'sandbox' && requestedEnv !== 'live') {
    return new Response('Invalid environment', { status: 400 });
  }
  const env: PaddleEnv = requestedEnv;
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
      case 'transaction.payment_failed':
        console.warn('Payment failed', event.data?.id, event.data?.subscriptionId);
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
