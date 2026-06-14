import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'generic',
      recipientEmail: 'info@orynth.dev',
      idempotencyKey: `orynth-hello-${new Date().toISOString().slice(0, 10)}`,
      templateData: {
        subject: 'Hello from MaintenEase',
        preheader: 'A quick hello from the MaintenEase team',
        html: '<p>Hi there,</p><p>This is a quick hello from the <strong>MaintenEase</strong> team — sent from our product domain (notify.maintenease.com) to confirm delivery to your inbox.</p><p>Feel free to reply if you have any questions.</p><p>— The MaintenEase Team</p>',
      },
    },
  })

  return new Response(JSON.stringify({ ok: !error, data, error }), {
    status: error ? 500 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})