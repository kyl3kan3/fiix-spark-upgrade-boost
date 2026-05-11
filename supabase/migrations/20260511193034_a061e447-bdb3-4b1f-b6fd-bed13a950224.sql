
-- 1) Replace user-writable INSERT policy with SECURITY DEFINER function
DROP POLICY IF EXISTS "Audit: members can insert their own entries" ON public.attachment_audit_log;

CREATE OR REPLACE FUNCTION public.log_attachment_event(
  _entity_type text,
  _entity_id uuid,
  _action text,
  _attachment_id uuid DEFAULT NULL,
  _details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cid uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _action NOT IN ('uploaded','deleted','reordered','updated') THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;
  SELECT company_id INTO _cid FROM public.profiles WHERE id = _uid;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'No company context';
  END IF;
  INSERT INTO public.attachment_audit_log
    (company_id, entity_type, entity_id, attachment_id, action, actor_id, details)
  VALUES
    (_cid, _entity_type, _entity_id, _attachment_id, _action, _uid, COALESCE(_details, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.log_attachment_event(text, uuid, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_attachment_event(text, uuid, text, uuid, jsonb) TO authenticated;

-- 2) Update weather-poll cron to include the shared secret header
SELECT cron.unschedule('weather-poll-every-15min');

SELECT cron.schedule(
  'weather-poll-every-15min',
  '*/15 * * * *',
  $cron$
  select net.http_post(
    url:='https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/weather-poll',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA',
      'x-notify-secret', 'ed5ede7dacf0a83d2873a2c20ab0975337b2c89d5b81e60c1ef50e0217850154'
    ),
    body:='{}'::jsonb
  ) as request_id;
  $cron$
);
