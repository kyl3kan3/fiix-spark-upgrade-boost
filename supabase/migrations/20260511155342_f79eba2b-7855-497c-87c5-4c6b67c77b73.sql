CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE
  _jobid bigint;
BEGIN
  SELECT jobid INTO _jobid FROM cron.job WHERE jobname = 'weather-poll-every-15min';
  IF _jobid IS NOT NULL THEN
    PERFORM cron.unschedule(_jobid);
  END IF;
END $$;

SELECT cron.schedule(
  'weather-poll-every-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url:='https://gowdckitwgmctqlpqzod.supabase.co/functions/v1/weather-poll',
    headers:='{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvd2Rja2l0d2dtY3RxbHBxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjE1MjksImV4cCI6MjA2MjM5NzUyOX0.1FWkUEhqOZk_pTpCJk46JGXXjXf9CljbAckaB1ZOxwA"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);