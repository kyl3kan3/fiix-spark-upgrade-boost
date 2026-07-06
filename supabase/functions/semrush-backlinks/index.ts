import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { requireSuperAdmin, semrushHeaders, SEMRUSH_GATEWAY } from '../_shared/semrushAuth.ts';

// Backlinks overview + top referring domains for a target.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = await requireSuperAdmin(req);
  if (auth instanceof Response) return auth;

  let body: { target?: string; target_type?: string } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const target = (body.target ?? 'maintenease.com').toString().toLowerCase().slice(0, 200);
  const targetType = (body.target_type ?? 'root_domain').toString();
  const h = semrushHeaders(auth);

  async function overview() {
    try {
      const url = `${SEMRUSH_GATEWAY}/backlinks/backlinks_overview?target=${encodeURIComponent(target)}&target_type=${targetType}&export_columns=ascore,total,domains_num,urls_num,ips_num,follows_num,nofollows_num,texts_num,images_num`;
      const res = await fetch(url, { headers: h });
      const json = await res.json();
      const row = json?.data?.rows?.[0];
      if (!res.ok || !row) return { error: json?.error ?? `HTTP ${res.status}` };
      return {
        authorityScore: Number(row[0]) || 0,
        totalBacklinks: Number(row[1]) || 0,
        referringDomains: Number(row[2]) || 0,
        referringUrls: Number(row[3]) || 0,
        referringIps: Number(row[4]) || 0,
        follows: Number(row[5]) || 0,
        nofollows: Number(row[6]) || 0,
        textBacklinks: Number(row[7]) || 0,
        imageBacklinks: Number(row[8]) || 0,
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }

  async function refDomains() {
    try {
      const url = `${SEMRUSH_GATEWAY}/backlinks/backlinks_refdomains?target=${encodeURIComponent(target)}&target_type=${targetType}&export_columns=domain_ascore,domain,backlinks_num,ip,country,first_seen,last_seen&display_limit=15`;
      const res = await fetch(url, { headers: h });
      const json = await res.json();
      if (!res.ok) return { error: json?.error ?? `HTTP ${res.status}` };
      const rows = (json?.data?.rows ?? []) as string[][];
      return {
        rows: rows.map((r) => ({
          authorityScore: Number(r[0]) || 0,
          domain: r[1],
          backlinks: Number(r[2]) || 0,
          country: r[4] || '',
          firstSeen: r[5] || null,
          lastSeen: r[6] || null,
        })),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }

  const [ov, rd] = await Promise.all([overview(), refDomains()]);
  return new Response(JSON.stringify({
    fetched_at: new Date().toISOString(),
    target,
    overview: ov,
    referring_domains: rd,
  }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});