import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function html(body: string, status = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><title>Google Analytics</title>
<body style="font-family:system-ui;padding:40px;text-align:center;">${body}</body>`, {
    status, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  });
}
function esc(s: string) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errParam = url.searchParams.get('error');
    if (errParam) return html(`<h2>Google Analytics connection failed</h2><p>${esc(errParam)}</p>`, 400);
    if (!code || !state) return html('<h2>Missing code or state</h2>', 400);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const CLIENT_ID = Deno.env.get('GOOGLE_ADS_CLIENT_ID')!;
    const CLIENT_SECRET = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: stateRow, error: stateErr } = await admin
      .from('google_analytics_oauth_states')
      .select('*').eq('state', state).maybeSingle();
    if (stateErr || !stateRow) return html('<h2>Invalid or expired state</h2>', 400);
    await admin.from('google_analytics_oauth_states').delete().eq('state', state);

    const redirectUri = `${SUPABASE_URL}/functions/v1/google-analytics-oauth-callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) return html(`<h2>Token exchange failed</h2><pre>${esc(JSON.stringify(tokenJson))}</pre>`, 400);

    const refresh_token = tokenJson.refresh_token;
    const access_token = tokenJson.access_token;
    const expires_in = tokenJson.expires_in ?? 3600;
    const scope = tokenJson.scope ?? '';
    if (!refresh_token) {
      return html('<h2>No refresh_token returned</h2><p>Revoke access at Google Account → Security, then try again.</p>', 400);
    }

    const { data: profile } = await admin.from('profiles').select('company_id').eq('id', stateRow.user_id).maybeSingle();

    // Auto-pick first GA4 property
    let property_id: string | null = null;
    let property_display_name: string | null = null;
    let account_display_name: string | null = null;
    try {
      const sumRes = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const sumJson = await sumRes.json();
      const accounts = sumJson?.accountSummaries ?? [];
      for (const a of accounts) {
        const props = a?.propertySummaries ?? [];
        if (props.length > 0) {
          property_id = props[0].property; // "properties/12345"
          property_display_name = props[0].displayName ?? null;
          account_display_name = a.displayName ?? null;
          break;
        }
      }
    } catch (_) { /* ignore */ }

    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString();
    // Remove prior connection(s) — single active connection
    await admin.from('google_analytics_connections').delete().not('id', 'is', null);
    await admin.from('google_analytics_connections').insert({
      company_id: profile?.company_id ?? null,
      connected_by: stateRow.user_id,
      refresh_token, access_token, token_expires_at,
      property_id, property_display_name, account_display_name, scope,
    });

    return html(`<h2>Google Analytics connected</h2><p>You can close this tab and return to the dashboard.</p>
<script>setTimeout(()=>window.close(), 1500);</script>`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return html(`<h2>Error</h2><pre>${esc(msg)}</pre>`, 500);
  }
});