-- Observability for the scheduled predictive-maintenance recompute.
--
-- The original run_scheduled_risk_recompute() wrapped its body in
-- `EXCEPTION WHEN OTHERS THEN RAISE WARNING`, which meant a misconfiguration
-- (e.g. a missing/unreadable `notify_shared_secret` Vault entry) failed silently
-- every 6 hours with no durable signal. This replaces it so that:
--   * the pg_net request id is captured and logged, making each dispatch
--     traceable in net._http_response, and
--   * genuine errors (Vault read / permissions) propagate, so pg_cron records
--     them in cron.job_run_details (status='failed') instead of hiding them.
--
-- Note: net.http_post is fire-and-forget, so a non-2xx HTTP response from the
-- edge function (e.g. 401 when NOTIFY_SHARED_SECRET is unset) is NOT raised
-- here — inspect net._http_response for the logged request id, or the
-- asset_risk_score_runs table, to confirm the call actually succeeded.

CREATE OR REPLACE FUNCTION public.run_scheduled_risk_recompute()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url text := 'https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/recompute-risk-scores';
  _secret text;
  _request_id bigint;
BEGIN
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets
  WHERE lower(name) = 'notify_shared_secret'
  LIMIT 1;

  IF _secret IS NULL THEN
    RAISE WARNING 'run_scheduled_risk_recompute: Vault secret notify_shared_secret not found; the edge function will reject this call';
  END IF;

  SELECT net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', COALESCE(_secret, '')
    ),
    body := jsonb_build_object('triggered_by', 'scheduled')
  ) INTO _request_id;

  RAISE LOG 'run_scheduled_risk_recompute: dispatched recompute, net request_id=%', _request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.run_scheduled_risk_recompute() FROM PUBLIC;
