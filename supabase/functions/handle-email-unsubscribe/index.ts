import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { boundedJson } from '../_shared/requestBody.ts';
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (!['GET', 'POST'].includes(req.method)) return reply(405, { error: 'Method not allowed' });
  try {
    let token: unknown = new URL(req.url).searchParams.get('token');
    if (req.method === 'POST' && !req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) token = (await boundedJson(req, 4096))?.token ?? token;
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{20,256}$/.test(token)) return reply(400, { error: 'Invalid token' });
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data: row, error } = await db.from('email_unsubscribe_tokens').select('email,used_at').eq('token', token).maybeSingle();
    if (error) throw new Error('Lookup unavailable');
    if (!row) return reply(404, { error: 'Invalid token' });
    if (req.method === 'GET') return reply(200, row.used_at ? { valid: false, reason: 'already_unsubscribed' } : { valid: true });
    // Suppress first; retries remain safe even if recording token usage fails.
    const { error: suppressionError } = await db.from('suppressed_emails').upsert({ email: row.email.trim().toLowerCase(), reason: 'unsubscribe' }, { onConflict: 'email' });
    if (suppressionError) throw new Error('Suppression unavailable');
    const { error: updateError } = await db.from('email_unsubscribe_tokens').update({ used_at: new Date().toISOString() }).eq('token', token);
    if (updateError) throw new Error('Token update unavailable');
    return reply(200, { success: true });
  } catch (error) {
    return reply(error instanceof RangeError ? 413 : error instanceof SyntaxError ? 400 : 500, { error: 'Unable to process unsubscribe' });
  }
});
