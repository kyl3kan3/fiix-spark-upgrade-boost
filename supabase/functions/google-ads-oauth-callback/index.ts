import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function html(body: string, status = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><title>Google Ads</title>
<body style="font-family:system-ui;padding:40px;text-align:center;">${body}</body>`, {
    status, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errParam = url.searchParams.get('error');
    if (errParam) return html(`<h2>Google Ads connection failed</h2><p>${errParam}</p>`, 400);
    if (!code || !state) return html('<h2>Missing code or state</h2>', 400);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const CLIENT_ID = Deno.env.get('GOOGLE_ADS_CLIENT_ID')!;
    const CLIENT_SECRET = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: stateRow, error: stateErr } = await admin
      .from('google_ads_oauth_states')
      .select('*').eq('state', state).maybeSingle();
    if (stateErr || !stateRow) return html('<h2>Invalid or expired state</h2>', 400);
    await admin.from('google_ads_oauth_states').delete().eq('state', state);

    const redirectUri = `${SUPABASE_URL}/functions/v1/google-ads-oauth-callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) return html(`<h2>Token exchange failed</h2><pre>${JSON.stringify(tokenJson)}</pre>`, 400);

    const refresh_token = tokenJson.refresh_token;
    const access_token = tokenJson.access_token;
    const expires_in = tokenJson.expires_in ?? 3600;
    const scope = tokenJson.scope ?? '';

    if (!refresh_token) {
      return html('<h2>No refresh_token returned</h2><p>Revoke access at Google Account → Security, then try again.</p>', 400);
    }

    // Look up the user's company
    const { data: profile } = await admin.from('profiles').select('company_id').eq('id', stateRow.user_id).maybeSingle();

    // Try to list accessible customers
    const DEV_TOKEN = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') ?? '';
    let customer_id: string | null = null;
    let account_descriptive_name: string | null = null;
    try {
      const listRes = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'developer-token': DEV_TOKEN,
        },
      });
      const listJson = await listRes.json();
      const resourceNames: string[] = listJson?.resourceNames ?? [];
      if (resourceNames.length > 0) {
        customer_id = resourceNames[0].split('/')[1];
      }
    } catch (_) { /* ignore */ }

    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    await admin.from('google_ads_connections').insert({
      company_id: profile?.company_id ?? null,
      connected_by: stateRow.user_id,
      refresh_token,
      access_token,
      token_expires_at,
      customer_id,
      account_descriptive_name,
      scope,
    });

    return html(`<h2>Google Ads connected</h2><p>You can close this tab and return to the dashboard.</p>
<script>setTimeout(()=>window.close(), 1500);</script>`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return html(`<h2>Error</h2><pre>${msg}</pre>`, 500);
  }
});