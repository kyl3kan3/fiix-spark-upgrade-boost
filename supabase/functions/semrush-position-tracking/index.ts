import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { requireSuperAdmin, semrushHeaders, SEMRUSH_GATEWAY } from '../_shared/semrushAuth.ts';

// Lists Semrush Position Tracking campaigns on the connected account.
// If a `campaign_id` is provided, also returns an organic visibility snapshot.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = await requireSuperAdmin(req);
  if (auth instanceof Response) return auth;

  let body: { campaign_id?: string | number } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const h = semrushHeaders(auth);

  async function listCampaigns() {
    try {
      const res = await fetch(`${SEMRUSH_GATEWAY}/tracking/campaigns`, { headers: h });
      const json = await res.json();
      if (!res.ok) return { error: json?.error ?? `HTTP ${res.status}` };
      return { campaigns: json?.data ?? json ?? [] };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }

  async function overview(id: string | number) {
    try {
      const url = `${SEMRUSH_GATEWAY}/tracking/v2/reports?campaign_id=${encodeURIComponent(String(id))}&type=tracking_overview_organic`;
      const res = await fetch(url, { headers: h });
      const json = await res.json();
      if (!res.ok) return { error: json?.error ?? `HTTP ${res.status}` };
      return { overview: json?.data ?? json };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }

  const campaigns = await listCampaigns();
  const detail = body.campaign_id ? await overview(body.campaign_id) : null;

  return new Response(JSON.stringify({
    fetched_at: new Date().toISOString(),
    ...campaigns,
    ...(detail ? detail : {}),
  }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});