-- Restrict public_requests PII to admins/managers only
DROP POLICY IF EXISTS "Members view their company requests" ON public.public_requests;
DROP POLICY IF EXISTS "Members update their company requests" ON public.public_requests;

CREATE POLICY "Managers update their company requests"
  ON public.public_requests
  FOR UPDATE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND (
      public.has_role(auth.uid(), 'administrator'::public.app_role)
      OR public.has_role(auth.uid(), 'manager'::public.app_role)
      OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    )
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND (
      public.has_role(auth.uid(), 'administrator'::public.app_role)
      OR public.has_role(auth.uid(), 'manager'::public.app_role)
      OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
    )
  );

-- Prevent administrators from granting administrator/super_admin roles.
-- Only super_admin (kyle@decent4.com via hardened is_super_admin) may grant administrator.
CREATE POLICY "Only super admin can grant administrator"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (
    role NOT IN ('administrator'::public.app_role, 'super_admin'::public.app_role)
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Only super admin can update to administrator"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  USING (true)
  WITH CHECK (
    role NOT IN ('administrator'::public.app_role, 'super_admin'::public.app_role)
    OR public.is_super_admin(auth.uid())
  );