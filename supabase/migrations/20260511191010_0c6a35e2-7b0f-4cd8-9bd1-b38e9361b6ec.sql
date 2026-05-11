
-- Update notification dispatcher to include shared secret header
CREATE OR REPLACE FUNCTION public.dispatch_notification_event(_event_type text, _payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _url text := 'https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/notify-event';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA';
  _secret text := 'ed5ede7dacf0a83d2873a2c20ab0975337b2c89d5b81e60c1ef50e0217850154';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', _anon,
      'Authorization', 'Bearer ' || _anon,
      'x-notify-secret', _secret
    ),
    body := jsonb_build_object('event_type', _event_type, 'payload', _payload)
  );
END;
$function$;

-- Update the pg_cron 'wo-due-soon-scan' job to include the shared secret
SELECT cron.unschedule('wo-due-soon-scan');
SELECT cron.schedule(
  'wo-due-soon-scan',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/notify-event',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA',
      'x-notify-secret', 'ed5ede7dacf0a83d2873a2c20ab0975337b2c89d5b81e60c1ef50e0217850154'
    ),
    body := jsonb_build_object('event_type', 'wo_scan_due', 'payload', jsonb_build_object('time', now()))
  );
  $$
);
