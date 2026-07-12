import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import type { Database } from '../../../src/integrations/supabase/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

type Segment = 'all_users' | 'trial_users' | 'paying_users' | 'churned_users';

async function refreshAccessToken(refresh_token: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_ADS_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`refresh failed: ${JSON.stringify(j)}`);
  return { access_token: j.access_token as string, expires_in: (j.expires_in as number) ?? 3600 };
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const normalizeEmail = (e: string) => e.trim().toLowerCase();

async function emailsForSegment(admin: SupabaseClient<Database>, segment: Segment): Promise<string[]> {
  // Collect company_ids matching the segment from subscriptions
  let companyIds: string[] | null = null;
  if (segment !== 'all_users') {
    let q = admin.from('subscriptions').select('company_id, status, tier');
    if (segment === 'trial_users') q = q.eq('status', 'trialing');
    else if (segment === 'paying_users') q = q.eq('status', 'active');
    else if (segment === 'churned_users') q = q.in('status', ['canceled', 'past_due']);
    const { data: subs, error } = await q;
    if (error) throw new Error(`subscriptions query failed: ${error.message}`);
    companyIds = Array.from(new Set((subs ?? []).map((subscription) => subscription.company_id)));
    if (companyIds.length === 0) return [];
  }

  let pq = admin.from('profiles').select('email').not('email', 'is', null);
  if (companyIds) pq = pq.in('company_id', companyIds);
  const { data: profs, error: perr } = await pq;
  if (perr) throw new Error(`profiles query failed: ${perr.message}`);
  const emails = (profs ?? [])
    .map((profile) => profile.email)
    .filter((email): email is string => Boolean(email));
  return Array.from(new Set(emails));
}

async function adsFetch(
  path: string,
  init: RequestInit,
  ctx: { access_token: string; dev_token: string; login_customer_id?: string | null },
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${ctx.access_token}`,
    'developer-token': ctx.dev_token,
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (ctx.login_customer_id) headers['login-customer-id'] = ctx.login_customer_id.replace(/-/g, '');
  const res = await fetch(`https://googleads.googleapis.com/v18${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* keep text */ }
  if (!res.ok) throw new Error(`Google Ads ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body as any;
}

async function findOrCreateUserList(
  customerId: string,
  listName: string,
  ctx: { access_token: string; dev_token: string; login_customer_id?: string | null },
): Promise<string> {
  // Try to find existing list by name
  const search = await adsFetch(
    `/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      body: JSON.stringify({
        query: `SELECT user_list.resource_name, user_list.name FROM user_list WHERE user_list.name = '${listName.replace(/'/g, "\\'")}' LIMIT 1`,
      }),
    },
    ctx,
  );
  const existing = search?.results?.[0]?.userList?.resourceName;
  if (existing) return existing;

  // Create CRM-based customer match list
  const create = await adsFetch(
    `/customers/${customerId}/userLists:mutate`,
    {
      method: 'POST',
      body: JSON.stringify({
        operations: [{
          create: {
            name: listName,
            description: 'Synced from MaintenEase',
            membershipLifeSpan: 540,
            crmBasedUserList: {
              uploadKeyType: 'CONTACT_INFO',
              dataSourceType: 'FIRST_PARTY',
            },
          },
        }],
      }),
    },
    ctx,
  );
  const resourceName = create?.results?.[0]?.resourceName;
  if (!resourceName) throw new Error(`failed to create user list: ${JSON.stringify(create)}`);
  return resourceName;
}

async function uploadHashedEmails(
  customerId: string,
  userListResource: string,
  hashedEmails: string[],
  ctx: { access_token: string; dev_token: string; login_customer_id?: string | null },
) {
  // 1. Create offline user data job
  const created = await adsFetch(
    `/customers/${customerId}/offlineUserDataJobs:create`,
    {
      method: 'POST',
      body: JSON.stringify({
        job: {
          type: 'CUSTOMER_MATCH_USER_LIST',
          customerMatchUserListMetadata: { userList: userListResource },
        },
      }),
    },
    ctx,
  );
  const resourceName = created?.resourceName;
  if (!resourceName) throw new Error(`failed to create offline job: ${JSON.stringify(created)}`);

  // 2. Add operations in chunks (max 100k per request; we'll chunk much smaller)
  const CHUNK = 1000;
  for (let i = 0; i < hashedEmails.length; i += CHUNK) {
    const slice = hashedEmails.slice(i, i + CHUNK);
    await adsFetch(
      `/${resourceName}:addOperations`,
      {
        method: 'POST',
        body: JSON.stringify({
          enablePartialFailure: true,
          operations: slice.map((h) => ({
            create: { userIdentifiers: [{ hashedEmail: h }] },
          })),
        }),
      },
      ctx,
    );
  }

  // 3. Run the job
  await adsFetch(`/${resourceName}:run`, { method: 'POST', body: '{}' }, ctx);
  return resourceName;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const DEV_TOKEN = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN');
    if (!DEV_TOKEN) return json({ error: 'GOOGLE_ADS_DEVELOPER_TOKEN not configured' }, 500);

    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const userClient = createClient<Database>(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: 'unauthorized' }, 401);
    const admin = createClient<Database>(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'super_admin')
      .maybeSingle();
    if (!roleRow) return json({ error: 'forbidden' }, 403);

    const body = await req.json().catch(() => ({}));
    const segment: Segment = (body?.segment ?? 'all_users') as Segment;
    const listName: string = body?.list_name ?? `MaintenEase — ${segment}`;
    if (!['all_users', 'trial_users', 'paying_users', 'churned_users'].includes(segment)) {
      return json({ error: 'invalid segment' }, 400);
    }

    const { data: conn } = await admin
      .from('google_ads_connections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!conn) return json({ error: 'Google Ads not connected' }, 400);
    if (!conn.customer_id) return json({ error: 'No customer_id on Google Ads connection' }, 400);

    // Refresh token if needed
    let access_token = conn.access_token as string | null;
    const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
    if (!access_token || expiresAt < Date.now() + 60_000) {
      const r = await refreshAccessToken(conn.refresh_token);
      access_token = r.access_token;
      await admin.from('google_ads_connections').update({
        access_token: r.access_token,
        token_expires_at: new Date(Date.now() + r.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', conn.id);
    }

    const ctx = {
      access_token: access_token!,
      dev_token: DEV_TOKEN,
      login_customer_id: conn.login_customer_id ?? null,
    };
    const customerId = (conn.customer_id as string).replace(/-/g, '');

    const emails = await emailsForSegment(admin, segment);
    if (emails.length === 0) {
      return json({ ok: true, segment, list_name: listName, emails_count: 0, message: 'No emails for segment' });
    }
    const hashed = await Promise.all(emails.map((e) => sha256Hex(normalizeEmail(e))));

    const userListResource = await findOrCreateUserList(customerId, listName, ctx);
    const jobResource = await uploadHashedEmails(customerId, userListResource, hashed, ctx);

    return json({
      ok: true,
      segment,
      list_name: listName,
      user_list: userListResource,
      job: jobResource,
      emails_count: emails.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error('audience-sync error', msg);
    return json({ error: msg }, 500);
  }
});
