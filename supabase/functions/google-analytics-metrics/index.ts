import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function refreshAccessToken(refresh_token: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_ADS_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!,
      refresh_token, grant_type: 'refresh_token',
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`refresh failed: ${JSON.stringify(j)}`);
  return { access_token: j.access_token as string, expires_in: (j.expires_in as number) ?? 3600 };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: 'unauthorized' }, 401);
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from('user_roles').select('role')
      .eq('user_id', userData.user.id).eq('role', 'super_admin').maybeSingle();
    if (!roleRow) return json({ error: 'forbidden' }, 403);

    let body: { property_id?: string } = {};
    try { body = await req.json(); } catch { /* GET or empty body */ }

    const { data: conn } = await admin
      .from('google_analytics_connections')
      .select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!conn) return json({ connected: false });

    let access_token = conn.access_token as string | null;
    const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
    if (!access_token || expiresAt < Date.now() + 60_000) {
      const r = await refreshAccessToken(conn.refresh_token);
      access_token = r.access_token;
      await admin.from('google_analytics_connections').update({
        access_token, token_expires_at: new Date(Date.now() + r.expires_in * 1000).toISOString(),
      }).eq('id', conn.id);
    }

    // List properties
    const propsRes = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const propsJson = await propsRes.json();
    const properties: { id: string; displayName: string; account: string }[] = [];
    for (const a of propsJson?.accountSummaries ?? []) {
      for (const p of a?.propertySummaries ?? []) {
        properties.push({ id: p.property, displayName: p.displayName, account: a.displayName });
      }
    }

    // Allow caller to switch property
    let property_id = body.property_id || conn.property_id;
    if (body.property_id && body.property_id !== conn.property_id) {
      const match = properties.find((p) => p.id === body.property_id);
      await admin.from('google_analytics_connections').update({
        property_id: body.property_id,
        property_display_name: match?.displayName ?? null,
        account_display_name: match?.account ?? null,
      }).eq('id', conn.id);
    }

    if (!property_id) {
      return json({
        connected: true, property_id: null, properties,
        error: 'No GA4 property selected. Pick one to start loading metrics.',
      });
    }

    const runReport = async (reqBody: unknown) => {
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${property_id}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(j));
      return j;
    };

    const totals = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' }, { name: 'sessions' },
        { name: 'screenPageViews' }, { name: 'conversions' },
        { name: 'engagementRate' }, { name: 'averageSessionDuration' },
      ],
    });

    const byDay = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    const topPages = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    const topSources = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'conversions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    const tRow = totals?.rows?.[0]?.metricValues ?? [];
    return json({
      connected: true,
      property_id,
      property_display_name: conn.property_display_name,
      account_display_name: conn.account_display_name,
      connected_at: conn.created_at,
      properties,
      totals: {
        activeUsers: Number(tRow[0]?.value ?? 0),
        sessions: Number(tRow[1]?.value ?? 0),
        pageViews: Number(tRow[2]?.value ?? 0),
        conversions: Number(tRow[3]?.value ?? 0),
        engagementRate: Number(tRow[4]?.value ?? 0),
        avgSessionDuration: Number(tRow[5]?.value ?? 0),
      },
      timeseries: (byDay?.rows ?? []).map((r: any) => ({
        date: r.dimensionValues?.[0]?.value,
        activeUsers: Number(r.metricValues?.[0]?.value ?? 0),
        sessions: Number(r.metricValues?.[1]?.value ?? 0),
      })),
      topPages: (topPages?.rows ?? []).map((r: any) => ({
        path: r.dimensionValues?.[0]?.value,
        views: Number(r.metricValues?.[0]?.value ?? 0),
        users: Number(r.metricValues?.[1]?.value ?? 0),
      })),
      topSources: (topSources?.rows ?? []).map((r: any) => ({
        channel: r.dimensionValues?.[0]?.value,
        sessions: Number(r.metricValues?.[0]?.value ?? 0),
        users: Number(r.metricValues?.[1]?.value ?? 0),
        conversions: Number(r.metricValues?.[2]?.value ?? 0),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return json({ error: msg }, 200);
  }
});