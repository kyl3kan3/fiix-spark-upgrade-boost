CREATE POLICY "Admins and managers can view company daily logs"
ON public.daily_logs
FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    public.has_role(auth.uid(), 'administrator'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
  )
);