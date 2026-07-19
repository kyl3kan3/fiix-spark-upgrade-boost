
CREATE TABLE public.backlink_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  domain text NOT NULL,
  url text,
  contact_name text,
  contact_email text,
  status text NOT NULL DEFAULT 'prospect',
  authority integer,
  notes text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.backlink_prospects TO authenticated;
GRANT ALL ON public.backlink_prospects TO service_role;

ALTER TABLE public.backlink_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view own company prospects" ON public.backlink_prospects
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role));

CREATE POLICY "Admins insert prospects" ON public.backlink_prospects
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role));

CREATE POLICY "Admins update prospects" ON public.backlink_prospects
  FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role))
  WITH CHECK (company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role));

CREATE POLICY "Admins delete prospects" ON public.backlink_prospects
  FOR DELETE TO authenticated
  USING (company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role));

CREATE TRIGGER set_backlink_prospects_updated_at
  BEFORE UPDATE ON public.backlink_prospects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX idx_backlink_prospects_company ON public.backlink_prospects(company_id, status);
