
-- Fix email_events deny-write to be RESTRICTIVE
DROP POLICY IF EXISTS "email_events: deny user writes" ON public.email_events;
CREATE POLICY "email_events: deny user writes"
  ON public.email_events
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Allow admins/managers to manage checklist asset links across their company
CREATE POLICY "Admins and managers can add asset links"
  ON public.checklist_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'administrator'::public.app_role)
     OR public.has_role(auth.uid(), 'manager'::public.app_role))
    AND checklist_id IN (
      SELECT id FROM public.checklists
      WHERE company_id = public.get_user_company(auth.uid())
    )
    AND asset_id IN (
      SELECT id FROM public.assets
      WHERE company_id = public.get_user_company(auth.uid())
    )
  );

CREATE POLICY "Admins and managers can remove asset links"
  ON public.checklist_assets
  FOR DELETE
  TO authenticated
  USING (
    (public.has_role(auth.uid(), 'administrator'::public.app_role)
     OR public.has_role(auth.uid(), 'manager'::public.app_role))
    AND checklist_id IN (
      SELECT id FROM public.checklists
      WHERE company_id = public.get_user_company(auth.uid())
    )
  );
