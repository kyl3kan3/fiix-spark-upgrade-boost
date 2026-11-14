import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeadersForRequest } from "../_shared/cors.ts";
import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
      });
    }
    const { priceId, environment } = await req.json();
    const env = (environment === 'live' ? 'live' : 'sandbox') as PaddleEnv;
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'priceId required' }), {
        status: 400, headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
      });
    }
    const res = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(priceId)}`);
    const data = await res.json();
    if (!data.data?.length) {
      return new Response(JSON.stringify({ error: 'Price not found' }), {
        status: 404, headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ paddleId: data.data[0].id }), {
      headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('get-paddle-price error', e);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500, headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
    });
  }
});