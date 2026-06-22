-- Guided setup: a personalized onboarding profile + generated plan per company.
--
-- Stores the answers a company gives during guided setup (goals, industry, team
-- size) plus the deterministic plan generated from them, so the personalized
-- dashboard can render their tailored recommendations and setup checklist.
-- One row per company (unique company_id). Multi-tenant + RLS conventions match
-- the rest of the schema: access is scoped via public.get_user_company(auth.uid()).

CREATE OR REPLACE FUNCTION public.update_onboarding_profiles_updated_at()
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

CREATE TABLE public.onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  goals TEXT[] NOT NULL DEFAULT '{}',
  industry TEXT,
  team_size TEXT,
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view onboarding profile in their company"
  ON public.onboarding_profiles FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create onboarding profile in their company"
  ON public.onboarding_profiles FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update onboarding profile in their company"
  ON public.onboarding_profiles FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_profiles_updated_at();

CREATE INDEX idx_onboarding_profiles_company ON public.onboarding_profiles(company_id);
