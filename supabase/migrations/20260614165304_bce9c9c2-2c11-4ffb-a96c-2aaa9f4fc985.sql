
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.asset_risk_score_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('manual','scheduled')),
  model_version TEXT NOT NULL DEFAULT 'heuristic-v1',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','empty')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.asset_risk_score_runs TO authenticated;
GRANT ALL ON public.asset_risk_score_runs TO service_role;

ALTER TABLE public.asset_risk_score_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "arsr_select" ON public.asset_risk_score_runs;
DROP POLICY IF EXISTS "arsr_insert" ON public.asset_risk_score_runs;
CREATE POLICY "arsr_select" ON public.asset_risk_score_runs
  FOR SELECT USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "arsr_insert" ON public.asset_risk_score_runs
  FOR INSERT WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_arsr_company_created
  ON public.asset_risk_score_runs(company_id, created_at DESC);
