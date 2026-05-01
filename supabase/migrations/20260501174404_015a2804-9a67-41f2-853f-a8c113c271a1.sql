
-- =========================
-- VENDORS
-- =========================
DROP POLICY IF EXISTS "Admins and managers can insert vendors in their company" ON public.vendors;
DROP POLICY IF EXISTS "Admins and managers can update vendors in their company" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage vendors in their company" ON public.vendors;
DROP POLICY IF EXISTS "Only admins can delete vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can view vendors in their company" ON public.vendors;

CREATE POLICY "Vendors: members can view"
ON public.vendors FOR SELECT
USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Vendors: admins/managers can insert"
ON public.vendors FOR INSERT
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND (
    public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Vendors: admins/managers can update"
ON public.vendors FOR UPDATE
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    public.has_role(auth.uid(), 'administrator'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  )
)
WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Vendors: admins can delete"
ON public.vendors FOR DELETE
USING (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::app_role)
);

-- =========================
-- COMPANIES
-- =========================
DROP POLICY IF EXISTS "Administrators can update company info" ON public.companies;
DROP POLICY IF EXISTS "Administrators can update their company" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete their companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON public.companies;
DROP POLICY IF EXISTS "Allow users to see their own companies" ON public.companies;
DROP POLICY IF EXISTS "Allow users to update their own companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

CREATE POLICY "Companies: members can view"
ON public.companies FOR SELECT
USING (id = public.get_user_company(auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Companies: authenticated can create"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Companies: admins can update"
ON public.companies FOR UPDATE
USING (
  id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::app_role)
)
WITH CHECK (id = public.get_user_company(auth.uid()));

CREATE POLICY "Companies: admins can delete"
ON public.companies FOR DELETE
USING (
  id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::app_role)
);

-- =========================
-- PROFILES
-- =========================
DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot change their own role or company" ON public.profiles;

CREATE POLICY "Profiles: view own or company"
ON public.profiles FOR SELECT
USING (id = auth.uid() OR company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Profiles: insert own"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Profiles: update own"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: cannot change role or company"
ON public.profiles AS RESTRICTIVE FOR UPDATE
USING (true)
WITH CHECK (
  id <> auth.uid()
  OR (
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

CREATE POLICY "Profiles: delete own"
ON public.profiles FOR DELETE
TO authenticated
USING (id = auth.uid());

-- =========================
-- ORGANIZATION_INVITATIONS
-- =========================
DROP POLICY IF EXISTS "Admins can insert invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Invited users or admins can SELECT invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Invited users or admins can UPDATE invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their organization" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can delete invitations for their organization" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can update invitations for their organization" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their organization" ON public.organization_invitations;

CREATE POLICY "Invitations: view for own org or invited email"
ON public.organization_invitations FOR SELECT
USING (
  organization_id = public.get_user_company(auth.uid())
  OR email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Invitations: admins can insert"
ON public.organization_invitations FOR INSERT
WITH CHECK (
  organization_id = public.get_user_company(auth.uid())
  AND invited_by = auth.uid()
  AND public.has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Invitations: admins or invitee can update"
ON public.organization_invitations FOR UPDATE
USING (
  (organization_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::app_role))
  OR email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Invitations: admins can delete"
ON public.organization_invitations FOR DELETE
USING (
  organization_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::app_role)
);
