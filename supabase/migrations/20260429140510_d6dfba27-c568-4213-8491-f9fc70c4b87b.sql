CREATE TABLE public.onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_id UUID NOT NULL,
  wizard_step INTEGER NOT NULL DEFAULT 0,
  wizard_complete BOOLEAN NOT NULL DEFAULT false,
  tour_complete BOOLEAN NOT NULL DEFAULT false,
  checklist_dismissed BOOLEAN NOT NULL DEFAULT false,
  tasks_completed JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding progress"
ON public.onboarding_progress
FOR SELECT
USING (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create their own onboarding progress"
ON public.onboarding_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update their own onboarding progress"
ON public.onboarding_progress
FOR UPDATE
USING (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_onboarding_progress_updated_at()
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

CREATE TRIGGER trg_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_onboarding_progress_updated_at();

CREATE INDEX idx_onboarding_progress_company ON public.onboarding_progress(company_id);