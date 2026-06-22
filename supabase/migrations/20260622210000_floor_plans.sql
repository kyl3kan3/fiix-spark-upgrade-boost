-- Building / floor-plan 3D viewer: upload a floor-plan image and pin assets onto
-- it. Rendered in the app as a perspective ("3D") plane with asset markers.
--
-- A private storage bucket holds the floor-plan images (namespaced under the
-- company id), plus two tables: floor_plans (one row per uploaded plan) and
-- floor_plan_markers (an asset pinned at relative x/y coords on a plan).
-- Multi-tenant + RLS conventions match the rest of the schema: every row carries
-- company_id and access is scoped via public.get_user_company(auth.uid()).

-- ---------------------------------------------------------------------------
-- Storage bucket + policies (private; first folder segment = company id)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Floor plans: company members can read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

CREATE POLICY "Floor plans: company members can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'floor-plans'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

CREATE POLICY "Floor plans: company members can delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_floor_plans_updated_at()
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
-- floor_plans
-- ---------------------------------------------------------------------------
CREATE TABLE public.floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view floor plans in their company"
  ON public.floor_plans FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "Users can create floor plans in their company"
  ON public.floor_plans FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "Users can update floor plans in their company"
  ON public.floor_plans FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "Users can delete floor plans in their company"
  ON public.floor_plans FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_floor_plans_updated_at
  BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_floor_plans_updated_at();

CREATE INDEX idx_floor_plans_company ON public.floor_plans(company_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- floor_plan_markers (an asset pinned at relative x/y on a plan)
-- ---------------------------------------------------------------------------
CREATE TABLE public.floor_plan_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  floor_plan_id UUID NOT NULL REFERENCES public.floor_plans(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  label TEXT,
  x NUMERIC NOT NULL DEFAULT 0.5 CHECK (x >= 0 AND x <= 1),
  y NUMERIC NOT NULL DEFAULT 0.5 CHECK (y >= 0 AND y <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.floor_plan_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view markers in their company"
  ON public.floor_plan_markers FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "Users can create markers in their company"
  ON public.floor_plan_markers FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "Users can update markers in their company"
  ON public.floor_plan_markers FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "Users can delete markers in their company"
  ON public.floor_plan_markers FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_floor_plan_markers_updated_at
  BEFORE UPDATE ON public.floor_plan_markers
  FOR EACH ROW EXECUTE FUNCTION public.update_floor_plans_updated_at();

CREATE INDEX idx_floor_plan_markers_plan ON public.floor_plan_markers(floor_plan_id);
