import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://maintenease.com/';
const GATEWAY = 'https://connector-gateway.lovable.dev/google_search_console/v1/urlInspection/index:inspect';

interface InspectResult {
  url: string;
  coverageState?: string;
  indexingState?: string;
  verdict?: string;
  lastCrawlTime?: string | null;
  pageFetchState?: string;
  robotsTxtState?: string;
  googleCanonical?: string | null;
  userCanonical?: string | null;
  inspectionResultLink?: string;
  error?: string;
}

async function inspectOne(loveKey: string, gscKey: string, inspectionUrl: string): Promise<InspectResult> {
  try {
    const res = await fetch(GATEWAY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loveKey}`,
        'X-Connection-Api-Key': gscKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inspectionUrl, siteUrl: SITE_URL }),
    });
    const text = await res.text();
    if (!res.ok) {
      return { url: inspectionUrl, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    }
    const data = JSON.parse(text);
    const idx = data?.inspectionResult?.indexStatusResult ?? {};
    return {
      url: inspectionUrl,
      coverageState: idx.coverageState,
      indexingState: idx.indexingState,
      verdict: idx.verdict,
      lastCrawlTime: idx.lastCrawlTime ?? null,
      pageFetchState: idx.pageFetchState,
      robotsTxtState: idx.robotsTxtState,
      googleCanonical: idx.googleCanonical ?? null,
      userCanonical: idx.userCanonical ?? null,
      inspectionResultLink: data?.inspectionResult?.inspectionResultLink,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { url: inspectionUrl, error: msg };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Require authenticated user (admin gating happens client-side; this endpoint
    // only proxies to Search Console which is non-sensitive read data).
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const loveKey = Deno.env.get('LOVABLE_API_KEY');
    const gscKey = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
    if (!loveKey) throw new Error('LOVABLE_API_KEY is not configured');
    if (!gscKey) throw new Error('GOOGLE_SEARCH_CONSOLE_API_KEY is not configured');

    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: 'urls[] required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Cap per-request size; the Search Console API is rate-limited.
    const limited = urls.slice(0, 50);

    // Light concurrency to avoid hammering the API.
    const results: InspectResult[] = [];
    const CONC = 4;
    for (let i = 0; i < limited.length; i += CONC) {
      const batch = limited.slice(i, i + CONC);
      const out = await Promise.all(batch.map((u) => inspectOne(loveKey, gscKey, u)));
      results.push(...out);
    }

    return new Response(JSON.stringify({ siteUrl: SITE_URL, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('seo-index-status error', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});