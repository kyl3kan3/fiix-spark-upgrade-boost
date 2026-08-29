import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  sendTemplateEmail,
  type SendTemplateEmailOptions,
  type SendTemplateEmailResult,
} from './send-email.ts'

// Records the outcome of a managed send in the project's email_send_log table.
// Notification-only: a failed log write never changes the send result.
async function logSend(entry: {
  template_name: string
  recipient_email: string
  status: 'sent' | 'suppressed' | 'failed'
  error_message?: string
}): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
  const { error } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: entry.template_name,
    recipient_email: entry.recipient_email,
    status: entry.status,
    error_message: entry.error_message ?? null,
  })
  if (error) {
    console.error('Failed to write email_send_log', {
      code: error.code,
      message: error.message,
    })
  }
}

/**
 * sendTemplateEmail plus the project's email_send_log bookkeeping.
 * Use this from feature edge functions instead of calling sendTemplateEmail
 * directly so send outcomes stay visible in the app's own log table.
 */
export async function sendTemplateEmailWithLog(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  try {
    const result = await sendTemplateEmail(templateName, to, options)
    await logSend({
      template_name: templateName,
      recipient_email: to,
      status: result.sent ? 'sent' : 'suppressed',
    })
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await logSend({
      template_name: templateName,
      recipient_email: to,
      status: 'failed',
      error_message: message.slice(0, 1000),
    })
    throw error
  }
}
