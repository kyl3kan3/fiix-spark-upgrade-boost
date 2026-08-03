-- 1. organizations: restrict INSERT to administrators / super admins
DROP POLICY IF EXISTS "Users can create organizations for their company" ON public.organizations;
CREATE POLICY "Admins can create organizations for their company"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  id = public.get_user_company_id()
  AND (
    public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.is_super_admin(auth.uid())
  )
);

-- 2. user_roles: consolidate restrictive privileged-role guards, apply to all roles
DROP POLICY IF EXISTS "Block self-grant of privileged roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block self-update to privileged roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admin can grant administrator" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admin can update to administrator" ON public.user_roles;

CREATE POLICY "Only super admin can grant privileged roles (insert)"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (
  role <> ALL (ARRAY['administrator'::app_role, 'super_admin'::app_role])
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Only super admin can grant privileged roles (update)"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO public
USING (
  role <> ALL (ARRAY['administrator'::app_role, 'super_admin'::app_role])
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  role <> ALL (ARRAY['administrator'::app_role, 'super_admin'::app_role])
  OR public.is_super_admin(auth.uid())
);

-- 3. marketing_leads: keep public submissions but scope to web roles only
DROP POLICY IF EXISTS "Anyone can submit a marketing lead" ON public.marketing_leads;
CREATE POLICY "Public visitors can submit a marketing lead"
ON public.marketing_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 120
  AND length(btrim(email)) BETWEEN 3 AND 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR length(phone) <= 40)
  AND (company IS NULL OR length(company) <= 160)
  AND (message IS NULL OR length(message) <= 2000)
);