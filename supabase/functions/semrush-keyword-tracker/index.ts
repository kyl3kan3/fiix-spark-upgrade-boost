import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/semrush';

interface Body {
  keyword?: string;
  databases?: string[];
}

const DEFAULT_KEYWORD = 'maintenance software';
const DEFAULT_DATABASES = ['us', 'uk', 'au', 'ca', 'de', 'in'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const SEMRUSH_API_KEY = Deno.env.get('SEMRUSH_API_KEY');
  if (!LOVABLE_API_KEY || !SEMRUSH_API_KEY) {
    return new Response(JSON.stringify({ error: 'Semrush connector not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: Body = {};
  try { body = await req.json(); } catch { /* allow empty */ }

  const keyword = (body.keyword ?? DEFAULT_KEYWORD).toString().slice(0, 200);
  const databases = (Array.isArray(body.databases) && body.databases.length > 0
    ? body.databases
    : DEFAULT_DATABASES
  ).slice(0, 12).map((d) => String(d).toLowerCase().slice(0, 5));

  const cols = 'Ph,Nq,Cp,Co,Kd';

  const results = await Promise.all(databases.map(async (database) => {
    try {
      const url = `${GATEWAY_URL}/keywords/phrase_this?phrase=${encodeURIComponent(keyword)}&database=${encodeURIComponent(database)}&export_columns=${cols}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': SEMRUSH_API_KEY,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.rows?.[0]) {
        return { database, error: json?.error ?? `HTTP ${res.status}` };
      }
      const row = json.data.rows[0];
      return {
        database,
        keyword: row[0],
        volume: Number(row[1]) || 0,
        cpc: Number(row[2]) || 0,
        competition: Number(row[3]) || 0,
        difficulty: Number(row[4]) || 0,
      };
    } catch (e) {
      return { database, error: e instanceof Error ? e.message : 'fetch failed' };
    }
  }));

  return new Response(JSON.stringify({ keyword, fetched_at: new Date().toISOString(), results }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});