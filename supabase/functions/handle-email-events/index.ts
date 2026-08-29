import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const REASON_STATUS: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const REASON_MESSAGE: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

async function record(
  reason: Reason,
  event: { event_id?: string; data?: Record<string, unknown> },
): Promise<void> {
  const recipient = String(
    (event.data?.recipient as string | undefined) ??
      (event.data?.to as string | undefined) ??
      '',
  ).toLowerCase()
  if (!recipient) {
    console.warn('Email event without recipient', { event_id: event.event_id })
    return
  }
  const messageId = (event.data?.message_id as string | undefined) ?? null

  const supabase = adminClient()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert({ email: recipient, reason, metadata: null }, { onConflict: 'email' })

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      code: suppressError.code,
      message: suppressError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: logError } = await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'system',
    recipient_email: recipient,
    status: REASON_STATUS[reason],
    error_message: REASON_MESSAGE[reason],
    metadata: null,
  })

  if (logError) {
    console.error('Failed to insert email_send_log', {
      code: logError.code,
      message: logError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to write send log')
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': async (event) => {
      await record('bounce', event as never)
    },
    'email.complaint': async (event) => {
      await record('complaint', event as never)
    },
    'email.unsubscribed': async (event) => {
      await record('unsubscribe', event as never)
    },
  },
})

Deno.serve((req) => handler(req))
