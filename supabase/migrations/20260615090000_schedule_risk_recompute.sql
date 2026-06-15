-- Scheduled predictive-maintenance recompute.
--
-- Wires up the every-6-hours cadence the dashboard advertises by having pg_cron
-- invoke the `recompute-risk-scores` edge function. The edge function authenticates
-- the call with the shared secret (NOTIFY_SHARED_SECRET) and, when no company_id is
-- supplied, recomputes risk scores for every company.
--
-- Prerequisites (set once, outside this migration):
--   1. Deploy the `recompute-risk-scores` edge function (configured with
--      verify_jwt = false in supabase/config.toml; it authenticates the call
--      itself via the shared secret below).
--   2. Set the function secret NOTIFY_SHARED_SECRET.
--   3. Store the same value as a Vault secret named `notify_shared_secret`
--      (Dashboard → Project Settings → Vault), so the call below can sign requests.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- SECURITY DEFINER wrapper so the cron job can read the Vault secret and post.
-- The function gateway runs with verify_jwt = false, so no apikey/JWT is needed —
-- the edge function gates access on the x-notify-secret shared secret instead.
CREATE OR REPLACE FUNCTION public.run_scheduled_risk_recompute()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url text := 'https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/recompute-risk-scores';
  _secret text;
BEGIN
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets
  WHERE lower(name) = 'notify_shared_secret'
  LIMIT 1;

  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', COALESCE(_secret, '')
    ),
    body := jsonb_build_object('triggered_by', 'scheduled')
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'run_scheduled_risk_recompute failed: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.run_scheduled_risk_recompute() FROM PUBLIC;

-- Reschedule idempotently: drop any prior job with this name, then (re)create it.
SELECT cron.unschedule('recompute-risk-scores-6h')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'recompute-risk-scores-6h');

SELECT cron.schedule(
  'recompute-risk-scores-6h',
  '0 */6 * * *',
  $$ SELECT public.run_scheduled_risk_recompute(); $$
);
