
DROP POLICY IF EXISTS "Users can update checklists they created" ON public.checklists;
CREATE POLICY "Users can update checklists they created"
ON public.checklists
FOR UPDATE
USING (created_by = auth.uid() AND company_id = public.get_user_company(auth.uid()))
WITH CHECK (created_by = auth.uid() AND company_id = public.get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Users can view their company ingest token" ON public.energy_ingest_tokens;
CREATE POLICY "Admins can view their company ingest token"
ON public.energy_ingest_tokens
FOR SELECT
USING (company_id = public.get_user_company(auth.uid()) AND public.has_role(auth.uid(), 'administrator'::public.app_role));
