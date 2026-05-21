import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/semrush';

interface Body {
  keyword?: string;
  databases?: string[];
}

const DEFAULT_KEYWORD = 'maintenance software';
const DEFAULT_DATABASES = ['us', 'uk', 'au', 'ca', 'de', 'in'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Require authenticated administrator. This endpoint consumes paid SEMRush
  // API credits, so it must not be callable anonymously or by regular users.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: roleRow } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .eq('role', 'administrator')
    .maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

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