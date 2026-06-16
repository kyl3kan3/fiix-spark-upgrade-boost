import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { template as generic } from '../_shared/transactional-email-templates/generic.tsx'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SHARED_SECRET = Deno.env.get('NOTIFY_SHARED_SECRET')
  if (!SHARED_SECRET || req.headers.get('x-notify-secret') !== SHARED_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const to = 'info@orynth.dev'
  const subject = 'Hello from MaintenEase'
  const data = {
    subject,
    preheader: 'A quick hello from the MaintenEase team',
    html: '<p>Hi there,</p><p>This is a quick hello from the <strong>MaintenEase</strong> team — sent from our product domain (notify.maintenease.com) to confirm delivery to your inbox.</p><p>Feel free to reply if you have any questions.</p><p>— The MaintenEase Team</p>',
  }

  const html = await renderAsync(React.createElement(generic.component, data))
  const text = await renderAsync(React.createElement(generic.component, data), { plainText: true })

  const messageId = crypto.randomUUID()

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'generic',
    recipient_email: to,
    status: 'pending',
  })

  const { error } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to,
      from: 'maintenease <noreply@maintenease.com>',
      sender_domain: 'notify.maintenease.com',
      subject,
      html,
      text,
      purpose: 'transactional',
      label: 'generic',
      idempotency_key: `orynth-hello-${new Date().toISOString().slice(0, 10)}`,
      queued_at: new Date().toISOString(),
    },
  })

  return new Response(JSON.stringify({ ok: !error, messageId, error }), {
    status: error ? 500 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})