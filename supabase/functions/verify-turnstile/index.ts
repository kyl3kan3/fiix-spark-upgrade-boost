import { corsHeadersForRequest } from "../_shared/cors.ts";

// Intentionally unauthenticated: browsers call this before login; Cloudflare verifies the token (verify_jwt=false).
Deno.serve(async (req) => {
  const corsHeaders = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
        status: 400,
        headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
      })
    }

    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'Turnstile not configured' }), {
        status: 500,
        headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
      })
    }

    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || ''
    const form = new URLSearchParams()
    form.append('secret', secret)
    form.append('response', token)
    if (ip) form.append('remoteip', ip.split(',')[0].trim())

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    const data = await verifyRes.json()

    return new Response(JSON.stringify({ success: !!data.success, errors: data['error-codes'] || [] }), {
      status: data.success ? 200 : 403,
      headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeadersForRequest(req), 'Content-Type': 'application/json' },
    })
  }
})