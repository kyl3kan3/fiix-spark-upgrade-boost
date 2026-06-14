
-- =====================================================================
-- 1. self_healing_runs
-- =====================================================================
CREATE TABLE public.self_healing_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  healer text NOT NULL,
  triggered_by text NOT NULL DEFAULT 'scheduled',
  actor_id uuid,
  status text NOT NULL DEFAULT 'success',
  scanned int NOT NULL DEFAULT 0,
  fixed int NOT NULL DEFAULT 0,
  flagged int NOT NULL DEFAULT 0,
  duration_ms int,
  error_message text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX self_healing_runs_company_created_idx
  ON public.self_healing_runs (company_id, created_at DESC);

GRANT SELECT ON public.self_healing_runs TO authenticated;
GRANT ALL ON public.self_healing_runs TO service_role;
ALTER TABLE public.self_healing_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their company runs"
  ON public.self_healing_runs FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

-- =====================================================================
-- 2. self_healing_actions
-- =====================================================================
CREATE TABLE public.self_healing_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.self_healing_runs(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  healer text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  details text,
  requires_review boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX self_healing_actions_run_idx
  ON public.self_healing_actions (run_id);
CREATE INDEX self_healing_actions_company_review_idx
  ON public.self_healing_actions (company_id, requires_review)
  WHERE requires_review = true AND reviewed_at IS NULL;

GRANT SELECT, UPDATE ON public.self_healing_actions TO authenticated;
GRANT ALL ON public.self_healing_actions TO service_role;
ALTER TABLE public.self_healing_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their company actions"
  ON public.self_healing_actions FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins mark actions reviewed"
  ON public.self_healing_actions FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
  );

-- =====================================================================
-- 3. self_healing_settings
-- =====================================================================
CREATE TABLE public.self_healing_settings (
  company_id uuid PRIMARY KEY,
  risk_scoring_enabled boolean NOT NULL DEFAULT true,
  work_orders_enabled boolean NOT NULL DEFAULT true,
  data_integrity_enabled boolean NOT NULL DEFAULT true,
  ai_triage_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.self_healing_settings TO authenticated;
GRANT ALL ON public.self_healing_settings TO service_role;
ALTER TABLE public.self_healing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their settings"
  ON public.self_healing_settings FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins insert their settings"
  ON public.self_healing_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  );

CREATE POLICY "Admins update their settings"
  ON public.self_healing_settings FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
  );

CREATE TRIGGER self_healing_settings_set_updated_at
  BEFORE UPDATE ON public.self_healing_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- =====================================================================
-- 4. public_request_triage
-- =====================================================================
CREATE TABLE public.public_request_triage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE REFERENCES public.public_requests(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  urgency text,
  category text,
  suggested_assignee_role text,
  summary text,
  reasoning text,
  model_version text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  accepted_at timestamptz,
  accepted_by uuid,
  work_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX public_request_triage_company_idx
  ON public.public_request_triage (company_id, created_at DESC);

GRANT SELECT, UPDATE ON public.public_request_triage TO authenticated;
GRANT ALL ON public.public_request_triage TO service_role;
ALTER TABLE public.public_request_triage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their triage"
  ON public.public_request_triage FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins accept triage"
  ON public.public_request_triage FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
  );

CREATE TRIGGER public_request_triage_set_updated_at
  BEFORE UPDATE ON public.public_request_triage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- =====================================================================
-- 5. Dispatcher: call triage-request edge fn on new public_request
-- =====================================================================
CREATE OR REPLACE FUNCTION public.dispatch_request_triage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url text := 'https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/triage-request';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac';
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
      'apikey', _anon,
      'Authorization', 'Bearer ' || _anon,
      'x-notify-secret', COALESCE(_secret, '')
    ),
    body := jsonb_build_object('request_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'dispatch_request_triage failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER public_requests_dispatch_triage
  AFTER INSERT ON public.public_requests
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_request_triage();
