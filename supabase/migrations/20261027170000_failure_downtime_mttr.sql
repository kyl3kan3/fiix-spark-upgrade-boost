-- Failure/downtime reason codes on work orders + MTTR summary RPC.

CREATE TABLE public.maintenance_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code_type TEXT NOT NULL CHECK (code_type IN ('failure', 'downtime')),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, code_type, code)
);

ALTER TABLE public.maintenance_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company maintenance codes" ON public.maintenance_codes FOR ALL
  USING (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'failure_downtime_codes'))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'failure_downtime_codes'));

ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS failure_code_id UUID REFERENCES public.maintenance_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS downtime_code_id UUID REFERENCES public.maintenance_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS downtime_minutes NUMERIC CHECK (downtime_minutes IS NULL OR downtime_minutes >= 0);

CREATE OR REPLACE FUNCTION public.get_mttr_summary(_days integer DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _since timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;
  _company_id := public.get_user_company(_uid);
  IF NOT public.has_feature(_company_id, 'failure_downtime_codes') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Failure/downtime codes require Pro or Business';
  END IF;
  _since := now() - make_interval(days => GREATEST(COALESCE(_days, 90), 1));
  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(t)::jsonb)
    FROM (
      SELECT
        mc.id AS failure_code_id,
        mc.code,
        mc.label,
        COUNT(*)::int AS completed_jobs,
        ROUND(AVG(wo.downtime_minutes)::numeric, 2) AS avg_downtime_minutes,
        ROUND(SUM(wo.downtime_minutes)::numeric, 2) AS total_downtime_minutes
      FROM public.work_orders wo
      JOIN public.maintenance_codes mc ON mc.id = wo.failure_code_id
      WHERE wo.company_id = _company_id
        AND wo.status = 'completed'
        AND wo.updated_at >= _since
        AND wo.downtime_minutes IS NOT NULL
      GROUP BY mc.id, mc.code, mc.label
      ORDER BY avg_downtime_minutes DESC NULLS LAST
    ) t
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _tier public.subscription_tier; _status public.subscription_status;
BEGIN
  IF _company_id IS NULL THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company_id;
  IF _tier IS NULL THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  RETURN CASE _feature
    WHEN 'analytics' THEN _tier IN ('pro','business')
    WHEN 'automations' THEN _tier IN ('pro','business')
    WHEN 'api' THEN _tier = 'business'
    WHEN 'sso' THEN _tier = 'business'
    WHEN 'lubricant_tracking' THEN _tier IN ('pro','business')
    WHEN 'parts_inventory' THEN _tier IN ('pro','business')
    WHEN 'meter_based_pm' THEN _tier IN ('pro','business')
    WHEN 'bulk_pm_generation' THEN _tier IN ('pro','business')
    WHEN 'purchasing' THEN _tier IN ('pro','business')
    WHEN 'failure_downtime_codes' THEN _tier IN ('pro','business')
    ELSE false END;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_codes TO authenticated;
REVOKE ALL ON FUNCTION public.get_mttr_summary(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_mttr_summary(integer) TO authenticated;
