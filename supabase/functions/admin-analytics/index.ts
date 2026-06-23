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

    // Internal accounts to exclude from analytics.
    // Configured via the EXCLUDED_INTERNAL_EMAILS secret (comma-separated list)
    // so personal emails aren't committed to source control.
    const EXCLUDED_EMAILS = (Deno.env.get('EXCLUDED_INTERNAL_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);
    const { data: excludedProfiles } = await admin
      .from('profiles')
      .select('id,company_id')
      .in('email', EXCLUDED_EMAILS);
    const excludedUserIds = (excludedProfiles ?? []).map((p: any) => p.id);
    const excludedCompanyIds = Array.from(
      new Set((excludedProfiles ?? []).map((p: any) => p.company_id).filter(Boolean)),
    );
    const excludedUserCount = excludedUserIds.length;
    const excludedCompanyCount = excludedCompanyIds.length;
    const notInUsers = excludedUserIds.length ? `(${excludedUserIds.join(',')})` : null;
    const notInCompanies = excludedCompanyIds.length ? `(${excludedCompanyIds.join(',')})` : null;

    const excludeUsers = <T>(q: T): T => {
      if (!notInUsers) return q;
      return (q as any).not('id', 'in', notInUsers);
    };
    const excludeCompanies = <T>(q: T): T => {
      if (!notInCompanies) return q;
      return (q as any).not('id', 'in', notInCompanies);
    };
    const excludeByCompanyCol = <T>(q: T): T => {
      if (!notInCompanies) return q;
      return (q as any).not('company_id', 'in', notInCompanies);
    };

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
      companiesRecent,
      locationsTotal,
      assetsTotal,
      workOrdersTotal,
      trialsAll,
    ] = await Promise.all([
      excludeUsers(admin.from('profiles').select('id', { count: 'exact', head: true })),
      excludeUsers(admin.from('profiles').select('id,created_at').gte('created_at', since)),
      excludeByCompanyCol(admin.from('subscriptions').select('id,tier,status,environment,created_at,updated_at,cancel_at_period_end,trial_ends_at,company_id')),
      excludeByCompanyCol(admin.from('subscriptions').select('created_at,updated_at,status,environment,company_id').gte('updated_at', since)),
      admin.from('marketing_leads').select('id', { count: 'exact', head: true }),
      admin.from('marketing_leads').select('created_at,source_slug').gte('created_at', since),
      admin.from('marketing_page_events').select('event_type,page_slug,created_at,user_agent,referrer').gte('created_at', since),
      excludeCompanies(admin.from('companies').select('id', { count: 'exact', head: true })),
      excludeCompanies(admin.from('companies').select('id,name,created_at').gte('created_at', since).order('created_at', { ascending: false })),
      excludeByCompanyCol(admin.from('locations').select('id', { count: 'exact', head: true })),
      excludeByCompanyCol(admin.from('assets').select('id', { count: 'exact', head: true })),
      excludeByCompanyCol(admin.from('work_orders').select('id', { count: 'exact', head: true })),
      excludeByCompanyCol(admin.from('subscriptions').select('company_id,trial_ends_at,tier').eq('status', 'trialing').not('trial_ends_at', 'is', null)),
    ]);

    const subs = subsAll.data ?? [];
    const events = eventsRecent.data ?? [];
    const newCompanies = companiesRecent.data ?? [];

    // Incomplete signups: users with a profile but no company_id
    const { data: incompleteRows, count: incompleteCount } = await excludeUsers(
      admin
        .from('profiles')
        .select('id,email,created_at', { count: 'exact' })
        .is('company_id', null)
        .order('created_at', { ascending: false })
        .limit(20),
    );
    const DISPOSABLE_DOMAINS = new Set([
      'wshu.net','mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com',
      'yopmail.com','trashmail.com','sharklasers.com','getnada.com','maildrop.cc',
    ]);
    const isDisposable = (email: string) => {
      const domain = email.split('@')[1]?.toLowerCase() ?? '';
      return DISPOSABLE_DOMAINS.has(domain);
    };
    const incompleteSignups = (incompleteRows ?? []).map((p: any) => {
      const ageHours = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (60 * 60 * 1000));
      return {
        id: p.id,
        email: p.email,
        created_at: p.created_at,
        age_hours: ageHours,
        disposable: isDisposable(p.email ?? ''),
      };
    });

    const totals = {
      total_users: profilesTotal.count ?? 0,
      total_companies: companiesTotal.count ?? 0,
      total_leads: leadsTotal.count ?? 0,
      total_locations: locationsTotal.count ?? 0,
      total_assets: assetsTotal.count ?? 0,
      total_work_orders: workOrdersTotal.count ?? 0,
      new_companies_in_range: newCompanies.length,
      incomplete_signups: incompleteCount ?? 0,
      incomplete_signups_disposable: incompleteSignups.filter((s) => s.disposable).length,
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
    const trialsStartedDaily = bucketByDay(
      (subsRecent.data ?? []).filter((s) => s.status === 'trialing'),
      days,
      (r) => r.created_at,
    );
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

    // Unique visitors (rough fingerprint: user_agent + referrer)
    const fp = (e: { user_agent?: string | null; referrer?: string | null }) =>
      `${e.user_agent ?? ''}|${e.referrer ?? ''}`;
    const visitorBuckets = new Map<string, Set<string>>();
    for (const e of events) {
      const key = (e.created_at ?? '').slice(0, 10);
      if (!key) continue;
      if (!visitorBuckets.has(key)) visitorBuckets.set(key, new Set());
      visitorBuckets.get(key)!.add(fp(e));
    }
    const visitorsDaily = buildDailySeries(days).map((d) => ({
      date: d.date,
      count: visitorBuckets.get(d.date)?.size ?? 0,
    }));
    const uniqueVisitors = new Set(events.map(fp)).size;

    const companiesCreatedDaily = bucketByDay(newCompanies, days);

    // Trials ending in next 7 days
    const nowMs = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const trialsRaw = (trialsAll.data ?? []).filter((t: any) => {
      const ts = new Date(t.trial_ends_at).getTime();
      return ts >= nowMs && ts - nowMs <= sevenDays;
    });
    const trialCompanyIds = Array.from(new Set(trialsRaw.map((t: any) => t.company_id)));
    let companyNameMap = new Map<string, string>();
    if (trialCompanyIds.length > 0) {
      const { data: cdata } = await admin.from('companies').select('id,name').in('id', trialCompanyIds);
      companyNameMap = new Map((cdata ?? []).map((c: any) => [c.id, c.name]));
    }
    const trialsEndingSoon = trialsRaw
      .map((t: any) => ({
        company_id: t.company_id,
        company_name: companyNameMap.get(t.company_id) ?? '—',
        tier: String(t.tier),
        trial_ends_at: t.trial_ends_at,
        days_remaining: Math.ceil((new Date(t.trial_ends_at).getTime() - nowMs) / (24 * 60 * 60 * 1000)),
      }))
      .sort((a, b) => a.days_remaining - b.days_remaining);

    const recentCompanies = newCompanies.slice(0, 20).map((c: any) => ({
      id: c.id,
      name: c.name,
      created_at: c.created_at,
    }));

    // Top referrers (by hostname)
    const referrerCounts: Record<string, number> = {};
    for (const e of events) {
      const r = (e.referrer ?? '').trim();
      if (!r) continue;
      try {
        const host = new URL(r).hostname.replace(/^www\./, '');
        referrerCounts[host] = (referrerCounts[host] ?? 0) + 1;
      } catch { /* ignore */ }
    }
    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return json({
      days,
      totals,
      byTier,
      signupsDaily,
      subsCreatedDaily,
      trialsStartedDaily,
      cancelsDaily,
      leadsDaily,
      eventsDaily,
      visitorsDaily,
      companiesCreatedDaily,
      uniqueVisitors,
      eventBreakdown,
      topPages,
      topReferrers,
      trialsEndingSoon,
      recentCompanies,
      incompleteSignups,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('admin-analytics error', e);
    return json({ error: 'An internal error occurred. Please try again.' }, 500);
  }
});