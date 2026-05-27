import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Scheduled (hourly) job — invoked by pg_cron with the anon key.
// No user input is accepted; verify_jwt is disabled in config.toml.
// All work is done with the service role.

const SITE_URL = 'https://maintenease.com'
const MAX_PER_RUN = 200

interface Stage {
  name: 'unverified_1h' | 'unverified_24h' | 'onboarding_24h' | 'onboarding_72h'
  template: 'signup-verify-reminder' | 'onboarding-reminder'
  templateData: (u: { firstName?: string }) => Record<string, unknown>
}

const STAGES: Record<Stage['name'], Stage> = {
  unverified_1h: {
    name: 'unverified_1h',
    template: 'signup-verify-reminder',
    templateData: (u) => ({ firstName: u.firstName, verifyUrl: `${SITE_URL}/auth` }),
  },
  unverified_24h: {
    name: 'unverified_24h',
    template: 'signup-verify-reminder',
    templateData: (u) => ({ firstName: u.firstName, verifyUrl: `${SITE_URL}/auth` }),
  },
  onboarding_24h: {
    name: 'onboarding_24h',
    template: 'onboarding-reminder',
    templateData: (u) => ({ firstName: u.firstName, onboardingUrl: `${SITE_URL}/onboarding` }),
  },
  onboarding_72h: {
    name: 'onboarding_72h',
    template: 'onboarding-reminder',
    templateData: (u) => ({ firstName: u.firstName, onboardingUrl: `${SITE_URL}/onboarding` }),
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const sharedSecret = Deno.env.get('NOTIFY_SHARED_SECRET')
  if (!sharedSecret || req.headers.get('x-notify-secret') !== sharedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  const now = Date.now()
  const HOUR = 60 * 60 * 1000
  const DAY = 24 * HOUR

  // Page through users (admin API is paginated, 1000/page max).
  type Candidate = {
    userId: string
    email: string
    firstName?: string
    stage: Stage['name']
  }
  const candidates: Candidate[] = []

  // 1) Pull unverified users (any signup_age >= 1h, <=7d) from auth.users.
  let page = 1
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) {
      console.error('listUsers failed', error)
      break
    }
    const users = data?.users ?? []
    if (users.length === 0) break
    for (const u of users) {
      if (!u.email) continue
      const created = new Date(u.created_at).getTime()
      const ageMs = now - created
      if (!u.email_confirmed_at) {
        if (ageMs >= 1 * HOUR && ageMs < 24 * HOUR) {
          candidates.push({ userId: u.id, email: u.email, stage: 'unverified_1h' })
        } else if (ageMs >= 24 * HOUR && ageMs < 7 * DAY) {
          candidates.push({ userId: u.id, email: u.email, stage: 'unverified_24h' })
        }
      }
    }
    if (users.length < 1000) break
    page += 1
  }

  // 2) Confirmed users with no company yet (and not personal).
  const onboardingCutoff = new Date(now - 14 * DAY).toISOString()
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id,email,first_name,created_at,account_type,company_id')
    .is('company_id', null)
    .neq('account_type', 'personal')
    .gte('created_at', onboardingCutoff)
    .limit(2000)

  if (profilesError) {
    console.error('profiles query failed', profilesError)
  } else {
    for (const p of profiles ?? []) {
      if (!p.email) continue
      const created = new Date(p.created_at as string).getTime()
      const ageMs = now - created
      if (ageMs >= 24 * HOUR && ageMs < 72 * HOUR) {
        candidates.push({
          userId: p.id as string,
          email: p.email as string,
          firstName: (p.first_name as string) || undefined,
          stage: 'onboarding_24h',
        })
      } else if (ageMs >= 72 * HOUR && ageMs < 14 * DAY) {
        candidates.push({
          userId: p.id as string,
          email: p.email as string,
          firstName: (p.first_name as string) || undefined,
          stage: 'onboarding_72h',
        })
      }
    }
  }

  if (candidates.length === 0) {
    return new Response(JSON.stringify({ sent: 0, scanned: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Filter out anyone already emailed for that stage.
  const userIds = Array.from(new Set(candidates.map((c) => c.userId)))
  const { data: alreadySent, error: sentErr } = await admin
    .from('signup_reminders_sent')
    .select('user_id,stage')
    .in('user_id', userIds)

  if (sentErr) {
    console.error('signup_reminders_sent query failed', sentErr)
    return new Response(JSON.stringify({ error: 'state lookup failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sentKey = new Set((alreadySent ?? []).map((r: any) => `${r.user_id}:${r.stage}`))
  const todo = candidates
    .filter((c) => !sentKey.has(`${c.userId}:${c.stage}`))
    .slice(0, MAX_PER_RUN)

  let sent = 0
  let failed = 0

  for (const c of todo) {
    const stage = STAGES[c.stage]
    try {
      const { error: invokeError } = await admin.functions.invoke('send-transactional-email', {
        body: {
          templateName: stage.template,
          recipientEmail: c.email,
          idempotencyKey: `signup-reminder-${c.userId}-${c.stage}`,
          templateData: stage.templateData({ firstName: c.firstName }),
        },
      })
      if (invokeError) throw invokeError

      const { error: logErr } = await admin
        .from('signup_reminders_sent')
        .insert({ user_id: c.userId, stage: c.stage })
      if (logErr && (logErr as any).code !== '23505') {
        console.error('Failed to record reminder send', logErr)
      }
      sent += 1
    } catch (e) {
      failed += 1
      console.error('Failed to send reminder', { userId: c.userId, stage: c.stage, error: e })
    }
  }

  return new Response(
    JSON.stringify({ scanned: candidates.length, sent, failed, eligible: todo.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})