-- Hardening for the live energy-ingest endpoint. Three additions:
--   1. last_used_at        — observability: when a token last received data, so
--                            stale/never-used integrations are visible in the UI.
--   2. rate_window_start / rate_count — fixed-window per-token rate limiting, so a
--                            leaked token can't hammer the endpoint indefinitely.
--   3. energy_readings.external_id    — an optional client-supplied idempotency key
--                            so retried/duplicate POSTs collapse to a single row.
--
-- The edge function (service role) calls consume_energy_ingest_token() once per
-- request: it atomically validates the token, advances the rate-limit window,
-- stamps last_used_at, and reports whether the request is within budget.

-- ---------------------------------------------------------------------------
-- 1 + 2. Token observability + rate-limit bookkeeping
-- ---------------------------------------------------------------------------
ALTER TABLE public.energy_ingest_tokens
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rate_window_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rate_count INTEGER NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 3. Idempotency key on readings
-- ---------------------------------------------------------------------------
-- Two readings with the same (company_id, external_id) collapse to one row.
-- NULLs are always distinct in a unique index, so manual/CSV rows (which never
-- set external_id) are completely unaffected.
ALTER TABLE public.energy_readings
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_energy_readings_external
  ON public.energy_readings (company_id, external_id);

-- ---------------------------------------------------------------------------
-- Atomic token consume: validate + rate-limit + stamp last_used_at in one go.
-- ---------------------------------------------------------------------------
-- Returns no row for an unknown token (caller treats empty as 403). When the
-- per-window budget is spent, returns allowed=false (caller responds 429). The
-- row is locked FOR UPDATE so concurrent POSTs on the same token serialize and
-- can't race the counter.
CREATE OR REPLACE FUNCTION public.consume_energy_ingest_token(
  _token TEXT,
  _max_per_window INTEGER DEFAULT 120,
  _window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE (company_id UUID, allowed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.energy_ingest_tokens%ROWTYPE;
  _reset BOOLEAN;
BEGIN
  SELECT * INTO _row FROM public.energy_ingest_tokens WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  _reset := _row.rate_window_start IS NULL
    OR _row.rate_window_start < now() - make_interval(secs => _window_seconds);

  UPDATE public.energy_ingest_tokens
  SET rate_window_start = CASE WHEN _reset THEN now() ELSE rate_window_start END,
      rate_count        = CASE WHEN _reset THEN 1   ELSE rate_count + 1 END,
      last_used_at      = now()
  WHERE id = _row.id
  RETURNING rate_count INTO _row.rate_count;

  company_id := _row.company_id;
  allowed := _row.rate_count <= _max_per_window;
  RETURN NEXT;
END;
$$;

-- Only the service role (the edge function) may consume tokens; never clients.
REVOKE ALL ON FUNCTION public.consume_energy_ingest_token(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_energy_ingest_token(TEXT, INTEGER, INTEGER) TO service_role;
