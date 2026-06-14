-- Predictive Maintenance: schema for the AI-powered (heuristic v1) risk engine.
--
-- Three tables make up the pipeline:
--   * asset_health_metrics  -> normalized condition signals (inputs)
--   * asset_failure_events   -> ground-truth failure history (labels / MTBF)
--   * asset_risk_scores      -> latest computed risk output per asset (one row/asset)
--
-- Multi-tenant + RLS conventions match the rest of the schema: every row carries
-- company_id and access is scoped via public.get_user_company(auth.uid()).

-- Shared updated_at trigger for the three predictive-maintenance tables.
CREATE OR REPLACE FUNCTION public.update_predictive_maintenance_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- asset_health_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.asset_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'runtime_hours', 'temperature', 'vibration', 'pressure',
    'error_count', 'manual_condition'
  )),
  value NUMERIC NOT NULL,
  unit TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN (
    'manual', 'daily_log', 'inspection', 'sensor'
  )),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view health metrics in their company"
  ON public.asset_health_metrics FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create health metrics in their company"
  ON public.asset_health_metrics FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update health metrics in their company"
  ON public.asset_health_metrics FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete health metrics in their company"
  ON public.asset_health_metrics FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_asset_health_metrics_updated_at
  BEFORE UPDATE ON public.asset_health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_predictive_maintenance_updated_at();

CREATE INDEX idx_asset_health_metrics_company ON public.asset_health_metrics(company_id);
CREATE INDEX idx_asset_health_metrics_asset ON public.asset_health_metrics(asset_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- asset_failure_events
-- ---------------------------------------------------------------------------
CREATE TABLE public.asset_failure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  failed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  downtime_minutes INTEGER,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )),
  root_cause TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_failure_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view failure events in their company"
  ON public.asset_failure_events FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create failure events in their company"
  ON public.asset_failure_events FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update failure events in their company"
  ON public.asset_failure_events FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete failure events in their company"
  ON public.asset_failure_events FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_asset_failure_events_updated_at
  BEFORE UPDATE ON public.asset_failure_events
  FOR EACH ROW EXECUTE FUNCTION public.update_predictive_maintenance_updated_at();

CREATE INDEX idx_asset_failure_events_company ON public.asset_failure_events(company_id);
CREATE INDEX idx_asset_failure_events_asset ON public.asset_failure_events(asset_id, failed_at DESC);

-- ---------------------------------------------------------------------------
-- asset_risk_scores (one latest row per asset; upserted by the engine)
-- ---------------------------------------------------------------------------
CREATE TABLE public.asset_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN (
    'low', 'medium', 'high', 'critical'
  )),
  failure_probability NUMERIC NOT NULL DEFAULT 0,
  predicted_failure_date TIMESTAMP WITH TIME ZONE,
  remaining_useful_life_days INTEGER,
  contributing_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_action TEXT,
  model_version TEXT NOT NULL DEFAULT 'heuristic-v1',
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT asset_risk_scores_asset_id_key UNIQUE (asset_id)
);

ALTER TABLE public.asset_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk scores in their company"
  ON public.asset_risk_scores FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create risk scores in their company"
  ON public.asset_risk_scores FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update risk scores in their company"
  ON public.asset_risk_scores FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete risk scores in their company"
  ON public.asset_risk_scores FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_asset_risk_scores_updated_at
  BEFORE UPDATE ON public.asset_risk_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_predictive_maintenance_updated_at();

CREATE INDEX idx_asset_risk_scores_company ON public.asset_risk_scores(company_id);
CREATE INDEX idx_asset_risk_scores_level ON public.asset_risk_scores(company_id, risk_level);
