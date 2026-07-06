import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { requireSuperAdmin, semrushHeaders, SEMRUSH_GATEWAY } from '../_shared/semrushAuth.ts';

// Returns domain overview (authority, traffic, keywords) + top organic competitors
// for a given domain. Uses Semrush /domains/domain_ranks and /domains/domain_domains.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = await requireSuperAdmin(req);
  if (auth instanceof Response) return auth;

  let body: { domain?: string; database?: string; competitors?: string[] } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const domain = (body.domain ?? 'maintenease.com').toString().toLowerCase().slice(0, 200);
  const database = (body.database ?? 'us').toString().toLowerCase().slice(0, 5);
  const competitors = (body.competitors ?? []).slice(0, 5).map(String);

  const h = semrushHeaders(auth);

  async function overview(d: string) {
    try {
      const url = `${SEMRUSH_GATEWAY}/domains/domain_ranks?domain=${encodeURIComponent(d)}&database=${database}&export_columns=Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac`;
      const res = await fetch(url, { headers: h });
      const json = await res.json();
      const row = json?.data?.rows?.[0];
      if (!res.ok || !row) return { domain: d, error: json?.error ?? `HTTP ${res.status}` };
      return {
        domain: d,
        rank: Number(row[2]) || 0,
        organicKeywords: Number(row[3]) || 0,
        organicTraffic: Number(row[4]) || 0,
        organicCost: Number(row[5]) || 0,
        adwordsKeywords: Number(row[6]) || 0,
        adwordsTraffic: Number(row[7]) || 0,
        adwordsCost: Number(row[8]) || 0,
      };
    } catch (e) {
      return { domain: d, error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }

  async function topCompetitors() {
    try {
      const url = `${SEMRUSH_GATEWAY}/domains/domain_organic_organic?domain=${encodeURIComponent(domain)}&database=${database}&export_columns=Dn,Cr,Np,Or,Ot,Oc&display_limit=10`;
      const res = await fetch(url, { headers: h });
      const json = await res.json();
      if (!res.ok) return { error: json?.error ?? `HTTP ${res.status}` };
      const rows = (json?.data?.rows ?? []) as string[][];
      return {
        competitors: rows.map((r) => ({
          domain: r[0],
          competitionLevel: Number(r[1]) || 0,
          commonKeywords: Number(r[2]) || 0,
          organicKeywords: Number(r[3]) || 0,
          organicTraffic: Number(r[4]) || 0,
        })),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }

  const [me, compsResult, ...compOverviews] = await Promise.all([
    overview(domain),
    topCompetitors(),
    ...competitors.map(overview),
  ]);

  return new Response(JSON.stringify({
    fetched_at: new Date().toISOString(),
    database,
    domain: me,
    competitors: compsResult,
    comparison: compOverviews,
  }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});