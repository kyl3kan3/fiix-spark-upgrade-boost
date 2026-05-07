
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Track which one-shot notifications have already been sent (prevents duplicates from cron + triggers)
CREATE TABLE IF NOT EXISTS public.notification_dispatch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  reference_id text NOT NULL,
  recipient_id uuid NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_type, reference_id, recipient_id)
);

ALTER TABLE public.notification_dispatch_log ENABLE ROW LEVEL SECURITY;

-- Only service role writes/reads this; users have no policies (service role bypasses RLS)
-- No policies created intentionally

-- Allow notifications table inserts from service role only (already the case via no INSERT policy + service role bypass)
-- But we also want our trigger function (running as definer) to insert. We'll use SECURITY DEFINER.

-- Helper: SECURITY DEFINER function that calls the notify-event edge function
CREATE OR REPLACE FUNCTION public.dispatch_notification_event(
  _event_type text,
  _payload jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url text := 'https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/notify-event';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', _anon,
      'Authorization', 'Bearer ' || _anon
    ),
    body := jsonb_build_object('event_type', _event_type, 'payload', _payload)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.dispatch_notification_event(text, jsonb) FROM PUBLIC, anon, authenticated;

-- Trigger: work_orders insert/update -> fire events
CREATE OR REPLACE FUNCTION public.work_orders_notify_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor uuid := auth.uid();
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to <> COALESCE(_actor, '00000000-0000-0000-0000-000000000000'::uuid) THEN
      PERFORM public.dispatch_notification_event(
        'wo_assigned',
        jsonb_build_object(
          'work_order_id', NEW.id,
          'title', NEW.title,
          'assignee_id', NEW.assigned_to,
          'actor_id', _actor
        )
      );
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Assignment changed
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       AND NEW.assigned_to IS NOT NULL
       AND NEW.assigned_to <> COALESCE(_actor, '00000000-0000-0000-0000-000000000000'::uuid) THEN
      PERFORM public.dispatch_notification_event(
        'wo_assigned',
        jsonb_build_object(
          'work_order_id', NEW.id,
          'title', NEW.title,
          'assignee_id', NEW.assigned_to,
          'actor_id', _actor
        )
      );
    END IF;

    -- Status changed
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM public.dispatch_notification_event(
        'wo_status_changed',
        jsonb_build_object(
          'work_order_id', NEW.id,
          'title', NEW.title,
          'old_status', OLD.status::text,
          'new_status', NEW.status::text,
          'creator_id', NEW.created_by,
          'assignee_id', NEW.assigned_to,
          'actor_id', _actor
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS work_orders_notify ON public.work_orders;
CREATE TRIGGER work_orders_notify
AFTER INSERT OR UPDATE ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.work_orders_notify_trigger();

-- Allow service role to insert into notifications (it already bypasses RLS, this is a no-op safety check)
-- The notify-event edge function will use service role to insert into notifications table.

-- Schedule due-soon scan every 15 minutes
SELECT cron.schedule(
  'wo-due-soon-scan',
  '*/15 * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/notify-event',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA'
    ),
    body := jsonb_build_object('event_type', 'wo_scan_due', 'payload', jsonb_build_object('time', now()))
  );
  $cron$
);
