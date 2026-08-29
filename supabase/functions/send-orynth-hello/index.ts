import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmailWithLog } from '../_shared/transactional-email-templates/send-with-log.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SHARED_SECRET = Deno.env.get('NOTIFY_SHARED_SECRET')
  if (!SHARED_SECRET || req.headers.get('x-notify-secret') !== SHARED_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const to = 'info@orynth.dev'

  try {
    const result = await sendTemplateEmailWithLog('generic', to, {
      idempotencyKey: `orynth-hello-${new Date().toISOString().slice(0, 10)}`,
      templateData: {
        subject: 'Hello from MaintenEase',
        preheader: 'A quick hello from the MaintenEase team',
        html:
          '<p>Hi there,</p><p>This is a quick hello from the <strong>MaintenEase</strong> team — sent from our product domain (notify.maintenease.com) to confirm delivery to your inbox.</p><p>Feel free to reply if you have any questions.</p><p>— The MaintenEase Team</p>',
      },
    })

    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('send-orynth-hello failed', message)
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
