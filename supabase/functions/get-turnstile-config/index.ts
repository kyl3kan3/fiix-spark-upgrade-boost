import { corsHeadersForRequest } from "../_shared/cors.ts";

// Intentionally public: exposes only the Turnstile site key for browser widgets (verify_jwt=false).
Deno.serve(async (req) => {
  const corsHeaders = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  const siteKey = Deno.env.get('TURNSTILE_SITE_KEY') || ''
  return new Response(JSON.stringify({ siteKey }), {
    headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
  })
})