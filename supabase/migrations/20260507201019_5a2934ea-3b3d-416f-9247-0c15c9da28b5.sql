
-- Add Resend message id to notifications so we can correlate events
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS company_id uuid;

CREATE INDEX IF NOT EXISTS idx_notifications_provider_message_id
  ON public.notifications(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_notifications_reference_id
  ON public.notifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id
  ON public.notifications(company_id);

-- Email events from Resend webhook
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_message_id text NOT NULL,
  event_type text NOT NULL,
  recipient_email text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_events_provider_message_id
  ON public.email_events(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_occurred_at
  ON public.email_events(occurred_at DESC);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Users can view email events tied to their own notifications
CREATE POLICY "Users view email events for their notifications"
ON public.email_events FOR SELECT
USING (
  provider_message_id IN (
    SELECT provider_message_id FROM public.notifications
    WHERE user_id = auth.uid() AND provider_message_id IS NOT NULL
  )
);

-- Admins can view all email events in their company
CREATE POLICY "Admins view all email events in company"
ON public.email_events FOR SELECT
USING (
  has_role(auth.uid(), 'administrator'::app_role)
  AND provider_message_id IN (
    SELECT provider_message_id FROM public.notifications
    WHERE company_id = get_user_company(auth.uid())
      AND provider_message_id IS NOT NULL
  )
);

-- Allow users to view their own notifications already exists; add company-admin view
DROP POLICY IF EXISTS "Admins view notifications in company" ON public.notifications;
CREATE POLICY "Admins view notifications in company"
ON public.notifications FOR SELECT
USING (
  has_role(auth.uid(), 'administrator'::app_role)
  AND company_id = get_user_company(auth.uid())
);

-- Allow viewing notifications for a work order in the same company (for WO history panel)
DROP POLICY IF EXISTS "Members view notifications by work order in company" ON public.notifications;
CREATE POLICY "Members view notifications by work order in company"
ON public.notifications FOR SELECT
USING (
  company_id = get_user_company(auth.uid())
  AND reference_id IN (
    SELECT id::text FROM public.work_orders wo
    WHERE wo.created_by IN (
      SELECT id FROM public.profiles WHERE company_id = get_user_company(auth.uid())
    )
  )
);
