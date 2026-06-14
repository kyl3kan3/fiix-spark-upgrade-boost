import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-transactional-email`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify({
      templateName: 'generic',
      recipientEmail: 'info@orynth.dev',
      idempotencyKey: `orynth-hello-${new Date().toISOString().slice(0, 10)}`,
      templateData: {
        subject: 'Hello from MaintenEase',
        preheader: 'A quick hello from the MaintenEase team',
        html: '<p>Hi there,</p><p>This is a quick hello from the <strong>MaintenEase</strong> team — sent from our product domain (notify.maintenease.com) to confirm delivery to your inbox.</p><p>Feel free to reply if you have any questions.</p><p>— The MaintenEase Team</p>',
      },
    }),
  })
  const text = await res.text()
  return new Response(JSON.stringify({ status: res.status, body: text }), {
    status: res.ok ? 200 : 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})