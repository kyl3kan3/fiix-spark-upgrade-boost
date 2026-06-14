
CREATE OR REPLACE FUNCTION public.update_predictive_maintenance_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.asset_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('runtime_hours','temperature','vibration','pressure','error_count','manual_condition')),
  value NUMERIC NOT NULL,
  unit TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','daily_log','inspection','sensor')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_health_metrics TO authenticated;
GRANT ALL ON public.asset_health_metrics TO service_role;
ALTER TABLE public.asset_health_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ahm_select" ON public.asset_health_metrics;
DROP POLICY IF EXISTS "ahm_insert" ON public.asset_health_metrics;
DROP POLICY IF EXISTS "ahm_update" ON public.asset_health_metrics;
DROP POLICY IF EXISTS "ahm_delete" ON public.asset_health_metrics;
CREATE POLICY "ahm_select" ON public.asset_health_metrics FOR SELECT USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ahm_insert" ON public.asset_health_metrics FOR INSERT WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ahm_update" ON public.asset_health_metrics FOR UPDATE USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ahm_delete" ON public.asset_health_metrics FOR DELETE USING (company_id = public.get_user_company(auth.uid()));
DROP TRIGGER IF EXISTS trg_asset_health_metrics_updated_at ON public.asset_health_metrics;
CREATE TRIGGER trg_asset_health_metrics_updated_at BEFORE UPDATE ON public.asset_health_metrics FOR EACH ROW EXECUTE FUNCTION public.update_predictive_maintenance_updated_at();
CREATE INDEX IF NOT EXISTS idx_asset_health_metrics_company ON public.asset_health_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_asset_health_metrics_asset ON public.asset_health_metrics(asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS public.asset_failure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  downtime_minutes INTEGER,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  root_cause TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_failure_events TO authenticated;
GRANT ALL ON public.asset_failure_events TO service_role;
ALTER TABLE public.asset_failure_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "afe_select" ON public.asset_failure_events;
DROP POLICY IF EXISTS "afe_insert" ON public.asset_failure_events;
DROP POLICY IF EXISTS "afe_update" ON public.asset_failure_events;
DROP POLICY IF EXISTS "afe_delete" ON public.asset_failure_events;
CREATE POLICY "afe_select" ON public.asset_failure_events FOR SELECT USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "afe_insert" ON public.asset_failure_events FOR INSERT WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "afe_update" ON public.asset_failure_events FOR UPDATE USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "afe_delete" ON public.asset_failure_events FOR DELETE USING (company_id = public.get_user_company(auth.uid()));
DROP TRIGGER IF EXISTS trg_asset_failure_events_updated_at ON public.asset_failure_events;
CREATE TRIGGER trg_asset_failure_events_updated_at BEFORE UPDATE ON public.asset_failure_events FOR EACH ROW EXECUTE FUNCTION public.update_predictive_maintenance_updated_at();
CREATE INDEX IF NOT EXISTS idx_asset_failure_events_company ON public.asset_failure_events(company_id);
CREATE INDEX IF NOT EXISTS idx_asset_failure_events_asset ON public.asset_failure_events(asset_id, failed_at DESC);

CREATE TABLE IF NOT EXISTS public.asset_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  failure_probability NUMERIC NOT NULL DEFAULT 0,
  predicted_failure_date TIMESTAMPTZ,
  remaining_useful_life_days INTEGER,
  contributing_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_action TEXT,
  model_version TEXT NOT NULL DEFAULT 'heuristic-v1',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT asset_risk_scores_asset_id_key UNIQUE (asset_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_risk_scores TO authenticated;
GRANT ALL ON public.asset_risk_scores TO service_role;
ALTER TABLE public.asset_risk_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ars_select" ON public.asset_risk_scores;
DROP POLICY IF EXISTS "ars_insert" ON public.asset_risk_scores;
DROP POLICY IF EXISTS "ars_update" ON public.asset_risk_scores;
DROP POLICY IF EXISTS "ars_delete" ON public.asset_risk_scores;
CREATE POLICY "ars_select" ON public.asset_risk_scores FOR SELECT USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ars_insert" ON public.asset_risk_scores FOR INSERT WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ars_update" ON public.asset_risk_scores FOR UPDATE USING (company_id = public.get_user_company(auth.uid())) WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "ars_delete" ON public.asset_risk_scores FOR DELETE USING (company_id = public.get_user_company(auth.uid()));
DROP TRIGGER IF EXISTS trg_asset_risk_scores_updated_at ON public.asset_risk_scores;
CREATE TRIGGER trg_asset_risk_scores_updated_at BEFORE UPDATE ON public.asset_risk_scores FOR EACH ROW EXECUTE FUNCTION public.update_predictive_maintenance_updated_at();
CREATE INDEX IF NOT EXISTS idx_asset_risk_scores_company ON public.asset_risk_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_asset_risk_scores_level ON public.asset_risk_scores(company_id, risk_level);
