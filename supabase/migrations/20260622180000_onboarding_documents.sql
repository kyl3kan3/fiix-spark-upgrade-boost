-- Document dump for onboarding: let a company upload a pile of source documents
-- (asset lists, manuals, warranties, floor plans, …) during onboarding and catalog
-- them for later processing.
--
-- Two parts:
--   * a private storage bucket `onboarding-docs`, with objects namespaced under
--     the company id as the first path segment, and
--   * a public.onboarding_documents catalog table (one row per uploaded file).
--
-- Multi-tenant + RLS conventions match the rest of the schema: every row carries
-- company_id and access is scoped via public.get_user_company(auth.uid()).

-- ---------------------------------------------------------------------------
-- Storage bucket + policies (private; first folder segment = company id)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-docs', 'onboarding-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Onboarding docs: company members can read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'onboarding-docs'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

CREATE POLICY "Onboarding docs: company members can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'onboarding-docs'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

CREATE POLICY "Onboarding docs: company members can update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'onboarding-docs'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

CREATE POLICY "Onboarding docs: company members can delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'onboarding-docs'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

-- ---------------------------------------------------------------------------
-- Catalog table
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_onboarding_documents_updated_at()
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

CREATE TABLE public.onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  uploaded_by UUID DEFAULT auth.uid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_bytes BIGINT,
  doc_kind TEXT NOT NULL DEFAULT 'other' CHECK (doc_kind IN (
    'asset_list', 'manual', 'warranty', 'floor_plan', 'invoice', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN (
    'uploaded', 'processing', 'processed', 'failed'
  )),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view onboarding documents in their company"
  ON public.onboarding_documents FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create onboarding documents in their company"
  ON public.onboarding_documents FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update onboarding documents in their company"
  ON public.onboarding_documents FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete onboarding documents in their company"
  ON public.onboarding_documents FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_onboarding_documents_updated_at
  BEFORE UPDATE ON public.onboarding_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_documents_updated_at();

CREATE INDEX idx_onboarding_documents_company ON public.onboarding_documents(company_id, created_at DESC);
