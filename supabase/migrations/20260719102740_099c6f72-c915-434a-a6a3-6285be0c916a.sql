
-- Fix 1: Remove hardcoded email from is_super_admin; rely solely on user_roles.
-- The enforce_super_admin_email trigger still gates who can be granted the role.
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'super_admin'::public.app_role
  );
$function$;

-- Fix 2: Add explicit WITH CHECK to the admin role-management policy.
DROP POLICY IF EXISTS "Admins can manage roles in their company" ON public.user_roles;
CREATE POLICY "Admins can manage roles in their company"
  ON public.user_roles
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (
    has_role(auth.uid(), 'administrator'::app_role)
    AND company_id = get_user_company(auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'administrator'::app_role)
    AND company_id = get_user_company(auth.uid())
  );
