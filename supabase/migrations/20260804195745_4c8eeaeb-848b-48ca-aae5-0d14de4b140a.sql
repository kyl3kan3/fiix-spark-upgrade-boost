-- 1. onboarding_documents: restrict to uploader or admins/managers
DROP POLICY IF EXISTS "Users can view onboarding documents in their company" ON public.onboarding_documents;
DROP POLICY IF EXISTS "Users can update onboarding documents in their company" ON public.onboarding_documents;
DROP POLICY IF EXISTS "Users can delete onboarding documents in their company" ON public.onboarding_documents;

CREATE POLICY "Uploader or admins can view onboarding documents"
ON public.onboarding_documents
FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR public.is_super_admin(auth.uid())
  )
);

CREATE POLICY "Uploader or admins can update onboarding documents"
ON public.onboarding_documents
FOR UPDATE
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR public.is_super_admin(auth.uid())
  )
)
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR public.is_super_admin(auth.uid())
  )
);

CREATE POLICY "Uploader or admins can delete onboarding documents"
ON public.onboarding_documents
FOR DELETE
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR public.is_super_admin(auth.uid())
  )
);

-- 2. user_roles: own role only, unless admin/manager/super admin
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;

CREATE POLICY "Users can view own role; admins view company roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    company_id = public.get_user_company(auth.uid())
    AND (
      public.has_role(auth.uid(), 'administrator'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_super_admin(auth.uid())
    )
  )
);