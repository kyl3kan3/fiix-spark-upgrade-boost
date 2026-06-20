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
    const DEV_TOKEN = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN');
    if (!DEV_TOKEN) return json({ error: 'GOOGLE_ADS_DEVELOPER_TOKEN not configured' }, 500);

    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: 'unauthorized' }, 401);
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'super_admin')
      .maybeSingle();
    if (!roleRow) return json({ error: 'forbidden' }, 403);

    const { data: conn } = await admin
      .from('google_ads_connections')
      .select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (!conn) return json({ connected: false });
    if (!conn.customer_id) {
      return json({ connected: true, customer_id: null, error: 'No customer_id on connection — link a Google Ads account first.' });
    }

    // refresh access token if expired/expiring
    let access_token = conn.access_token as string | null;
    const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
    if (!access_token || expiresAt < Date.now() + 60_000) {
      const r = await refreshAccessToken(conn.refresh_token);
      access_token = r.access_token;
      const newExpiry = new Date(Date.now() + r.expires_in * 1000).toISOString();
      await admin.from('google_ads_connections').update({
        access_token, token_expires_at: newExpiry,
      }).eq('id', conn.id);
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${access_token}`,
      'developer-token': DEV_TOKEN,
      'Content-Type': 'application/json',
    };
    if (conn.login_customer_id) headers['login-customer-id'] = conn.login_customer_id;

    const query = `
      SELECT
        campaign.id, campaign.name, campaign.status,
        metrics.impressions, metrics.clicks, metrics.cost_micros,
        metrics.conversions, metrics.ctr, metrics.average_cpc
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
      ORDER BY metrics.cost_micros DESC
      LIMIT 50`;

    const url = `https://googleads.googleapis.com/v17/customers/${conn.customer_id}/googleAds:search`;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ query }) });
    const data = await res.json();
    if (!res.ok) return json({ connected: true, customer_id: conn.customer_id, error: data }, 200);

    const campaigns = (data.results ?? []).map((r: any) => ({
      id: r.campaign?.id,
      name: r.campaign?.name,
      status: r.campaign?.status,
      impressions: Number(r.metrics?.impressions ?? 0),
      clicks: Number(r.metrics?.clicks ?? 0),
      cost: Number(r.metrics?.costMicros ?? 0) / 1_000_000,
      conversions: Number(r.metrics?.conversions ?? 0),
      ctr: Number(r.metrics?.ctr ?? 0),
      avg_cpc: Number(r.metrics?.averageCpc ?? 0) / 1_000_000,
    }));
    const totals = campaigns.reduce((acc: any, c: any) => ({
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      cost: acc.cost + c.cost,
      conversions: acc.conversions + c.conversions,
    }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 });

    return json({
      connected: true,
      customer_id: conn.customer_id,
      account_name: conn.account_descriptive_name,
      connected_at: conn.created_at,
      totals, campaigns,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return json({ error: msg }, 500);
  }
});