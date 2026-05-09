CREATE POLICY "Creators or admins can delete work orders"
ON public.work_orders
FOR DELETE
USING (
  (auth.uid() = created_by)
  OR (
    has_role(auth.uid(), 'administrator'::app_role)
    AND created_by IN (
      SELECT p.id FROM public.profiles p
      WHERE p.company_id = get_user_company(auth.uid())
    )
  )
);