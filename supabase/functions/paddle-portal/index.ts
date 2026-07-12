import { createClient } from 'npm:@supabase/supabase-js@2';
import { getPaddleClient, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    const { data: profile, error: profileError } = await adminClient
      .from('profiles').select('company_id').eq('id', user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.company_id) {
      return new Response(JSON.stringify({ error: 'No company' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: role, error: roleError } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('company_id', profile.company_id)
      .eq('role', 'administrator')
      .maybeSingle();
    if (roleError) throw roleError;
    if (!role) {
      return new Response(JSON.stringify({ error: 'Administrator access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sub, error: subscriptionError } = await adminClient
      .from('subscriptions')
      .select('paddle_customer_id, paddle_subscription_id, environment')
      .eq('company_id', profile.company_id)
      .maybeSingle();
    if (subscriptionError) throw subscriptionError;
    if (!sub?.paddle_customer_id) {
      return new Response(JSON.stringify({ error: 'No subscription' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const env = (sub.environment || 'sandbox') as PaddleEnv;
    const paddle = getPaddleClient(env);
    const subIds = sub.paddle_subscription_id ? [sub.paddle_subscription_id] : [];
    const session = await paddle.customerPortalSessions.create(sub.paddle_customer_id, subIds);
    return new Response(JSON.stringify({ url: session.urls.general.overview }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('paddle-portal error', e);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
