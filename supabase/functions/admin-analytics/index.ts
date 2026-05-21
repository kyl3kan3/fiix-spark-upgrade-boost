import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDailySeries(days: number) {
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push({ date: dayKey(daysAgo(i)), count: 0 });
  }
  return out;
}

function bucketByDay<T extends { created_at?: string | null }>(
  rows: T[],
  days: number,
  getDate: (row: T) => string | null | undefined = (r) => r.created_at,
) {
  const series = buildDailySeries(days);
  const idx = new Map(series.map((s, i) => [s.date, i]));
  for (const r of rows) {
    const raw = getDate(r);
    if (!raw) continue;
    const key = raw.slice(0, 10);
    const i = idx.get(key);
    if (i !== undefined) series[i].count++;
  }
  return series;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller is an administrator
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'super_admin')
      .maybeSingle();
    if (!roleRow) return json({ error: 'Forbidden' }, 403);

    const url = new URL(req.url);
    const days = Math.max(7, Math.min(90, Number(url.searchParams.get('days') ?? '30')));
    const since = daysAgo(days - 1).toISOString();

    // Parallel queries
    const [
      profilesTotal,
      profilesRecent,
      subsAll,
      subsRecent,
      leadsTotal,
      leadsRecent,
      eventsRecent,
      companiesTotal,
    ] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('created_at').gte('created_at', since),
      admin.from('subscriptions').select('id,tier,status,environment,created_at,updated_at,cancel_at_period_end'),
      admin.from('subscriptions').select('created_at,updated_at,status,environment').gte('updated_at', since),
      admin.from('marketing_leads').select('id', { count: 'exact', head: true }),
      admin.from('marketing_leads').select('created_at,source_slug').gte('created_at', since),
      admin.from('marketing_page_events').select('event_type,page_slug,created_at').gte('created_at', since),
      admin.from('companies').select('id', { count: 'exact', head: true }),
    ]);

    const subs = subsAll.data ?? [];
    const events = eventsRecent.data ?? [];

    const totals = {
      total_users: profilesTotal.count ?? 0,
      total_companies: companiesTotal.count ?? 0,
      total_leads: leadsTotal.count ?? 0,
      active_subscriptions: subs.filter((s) => s.status === 'active' || s.status === 'trialing').length,
      live_subscriptions: subs.filter((s) => s.environment === 'live' && (s.status === 'active' || s.status === 'trialing')).length,
      trialing_subscriptions: subs.filter((s) => s.status === 'trialing').length,
      canceled_subscriptions: subs.filter((s) => s.status === 'canceled' || s.cancel_at_period_end).length,
      past_due_subscriptions: subs.filter((s) => s.status === 'past_due').length,
    };

    // By tier (live + sandbox active)
    const tierCounts: Record<string, number> = {};
    for (const s of subs) {
      if (s.status !== 'active' && s.status !== 'trialing') continue;
      const t = String(s.tier);
      tierCounts[t] = (tierCounts[t] ?? 0) + 1;
    }
    const byTier = Object.entries(tierCounts).map(([tier, count]) => ({ tier, count }));

    // Daily series
    const signupsDaily = bucketByDay(profilesRecent.data ?? [], days);
    const subsCreatedDaily = bucketByDay(subsRecent.data ?? [], days);
    const cancelsDaily = bucketByDay(
      (subsRecent.data ?? []).filter((s) => s.status === 'canceled'),
      days,
      (r) => r.updated_at,
    );
    const leadsDaily = bucketByDay(leadsRecent.data ?? [], days);

    // Marketing events
    const eventCounts: Record<string, number> = {};
    const pageViewsByPage: Record<string, number> = {};
    for (const e of events) {
      eventCounts[e.event_type] = (eventCounts[e.event_type] ?? 0) + 1;
      if (e.event_type === 'page_view') {
        pageViewsByPage[e.page_slug] = (pageViewsByPage[e.page_slug] ?? 0) + 1;
      }
    }
    const eventBreakdown = Object.entries(eventCounts)
      .map(([event_type, count]) => ({ event_type, count }))
      .sort((a, b) => b.count - a.count);
    const topPages = Object.entries(pageViewsByPage)
      .map(([page_slug, count]) => ({ page_slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const eventsDaily = bucketByDay(events, days);

    return json({
      days,
      totals,
      byTier,
      signupsDaily,
      subsCreatedDaily,
      cancelsDaily,
      leadsDaily,
      eventsDaily,
      eventBreakdown,
      topPages,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('admin-analytics error', e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});