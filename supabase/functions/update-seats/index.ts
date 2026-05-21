import { createClient } from 'npm:@supabase/supabase-js@2';
import { getPaddleClient, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { extraSeats } = await req.json();
    const desired = Math.max(0, Math.floor(Number(extraSeats ?? 0)));
    if (!Number.isFinite(desired) || desired > 500) {
      return json({ error: 'Invalid seat count' }, 400);
    }

    const { data: profile } = await userClient
      .from('profiles').select('company_id').eq('id', user.id).maybeSingle();
    if (!profile?.company_id) return json({ error: 'No company' }, 400);

    const { data: sub } = await userClient
      .from('subscriptions')
      .select('paddle_subscription_id, paddle_price_id, billing_interval, environment, paid_seats')
      .eq('company_id', profile.company_id)
      .maybeSingle();
    if (!sub?.paddle_subscription_id) return json({ error: 'No subscription' }, 404);

    const env = (sub.environment || 'sandbox') as PaddleEnv;
    const seatExternalId = sub.billing_interval === 'year' ? 'extra_seat_yearly' : 'extra_seat_monthly';
    const paddle = getPaddleClient(env);

    // Resolve internal Paddle IDs from external IDs
    const [seatPriceResp, planSub] = await Promise.all([
      paddle.prices.list({ perPage: 200 }).next() as any,
      paddle.subscriptions.get(sub.paddle_subscription_id),
    ]);
    // Find seat price by external_id
    const allPrices = await paddle.prices.list({ perPage: 200 });
    let seatPriceId: string | null = null;
    for await (const p of allPrices) {
      const ext = (p as any).importMeta?.externalId;
      if (ext === seatExternalId) {
        seatPriceId = (p as any).id;
        break;
      }
    }
    if (!seatPriceId) return json({ error: `Seat price ${seatExternalId} not found` }, 500);

    // Rebuild items: keep existing plan item, set seat item quantity (or omit if 0)
    const items: { priceId: string; quantity: number }[] = [];
    for (const it of (planSub as any).items ?? []) {
      const ext = it?.price?.importMeta?.externalId as string | undefined;
      if (!ext) continue;
      if (ext.startsWith('extra_seat')) continue; // we set this explicitly below
      items.push({ priceId: it.price.id, quantity: it.quantity ?? 1 });
    }
    if (desired > 0) items.push({ priceId: seatPriceId, quantity: desired });

    await paddle.subscriptions.update(sub.paddle_subscription_id, {
      items,
      prorationBillingMode: 'prorated_immediately' as any,
    });

    return json({ ok: true, extraSeats: desired });
  } catch (e) {
    console.error('update-seats error', e);
    return json({ error: (e as Error).message || 'Failed to update seats' }, 500);
  }
});