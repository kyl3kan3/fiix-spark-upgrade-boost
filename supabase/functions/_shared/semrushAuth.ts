import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

export interface SemrushEnv {
  lovableKey: string;
  semrushKey: string;
}

export async function requireSuperAdmin(req: Request): Promise<Response | SemrushEnv> {
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
    .from('user_roles').select('role')
    .eq('user_id', userData.user.id).eq('role', 'super_admin').maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const lovableKey = Deno.env.get('LOVABLE_API_KEY') ?? '';
  const semrushKey = Deno.env.get('SEMRUSH_API_KEY') ?? '';
  if (!lovableKey || !semrushKey) {
    return new Response(JSON.stringify({ error: 'Semrush connector not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  return { lovableKey, semrushKey };
}

export function semrushHeaders(env: SemrushEnv) {
  return {
    'Authorization': `Bearer ${env.lovableKey}`,
    'X-Connection-Api-Key': env.semrushKey,
  };
}

export const SEMRUSH_GATEWAY = 'https://connector-gateway.lovable.dev/semrush';