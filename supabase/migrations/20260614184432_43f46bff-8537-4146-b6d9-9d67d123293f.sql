
-- 1) checklist_schedules: restrict INSERT/UPDATE to creator + admin/manager
DROP POLICY IF EXISTS "Users can insert schedules for their company's checklists" ON public.checklist_schedules;
DROP POLICY IF EXISTS "Users can update schedules for their company's checklists" ON public.checklist_schedules;

CREATE POLICY "Creators or admins can insert schedules"
  ON public.checklist_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    checklist_id IN (
      SELECT c.id FROM public.checklists c
      WHERE c.company_id = public.get_user_company(auth.uid())
        AND (
          c.created_by = auth.uid()
          OR public.has_role(auth.uid(), 'administrator'::public.app_role)
          OR public.has_role(auth.uid(), 'manager'::public.app_role)
        )
    )
  );

CREATE POLICY "Creators or admins can update schedules"
  ON public.checklist_schedules
  FOR UPDATE
  TO authenticated
  USING (
    checklist_id IN (
      SELECT c.id FROM public.checklists c
      WHERE c.company_id = public.get_user_company(auth.uid())
        AND (
          c.created_by = auth.uid()
          OR public.has_role(auth.uid(), 'administrator'::public.app_role)
          OR public.has_role(auth.uid(), 'manager'::public.app_role)
        )
    )
  )
  WITH CHECK (
    checklist_id IN (
      SELECT c.id FROM public.checklists c
      WHERE c.company_id = public.get_user_company(auth.uid())
        AND (
          c.created_by = auth.uid()
          OR public.has_role(auth.uid(), 'administrator'::public.app_role)
          OR public.has_role(auth.uid(), 'manager'::public.app_role)
        )
    )
  );

-- 2) google_ads_connections: explicit service-role-only writes; explicit deny for authenticated.
CREATE POLICY "Deny authenticated writes on google_ads_connections"
  ON public.google_ads_connections
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role manages google_ads_connections"
  ON public.google_ads_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3) email_unsubscribe_tokens: allow service role to delete used tokens.
CREATE POLICY "Service role can delete tokens"
  ON public.email_unsubscribe_tokens
  FOR DELETE
  TO service_role
  USING (true);
