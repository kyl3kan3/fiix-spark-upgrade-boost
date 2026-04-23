
-- ASSETS: drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can create assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON public.assets;

-- LOCATIONS: drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can create locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can update locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can delete locations" ON public.locations;

-- VENDOR_ASSETS: drop permissive policies and add company-scoped ones
DROP POLICY IF EXISTS "Authenticated users can view vendor_assets" ON public.vendor_assets;
DROP POLICY IF EXISTS "Authenticated users can delete vendor_assets" ON public.vendor_assets;
DROP POLICY IF EXISTS "Users can view vendor assets" ON public.vendor_assets;

CREATE POLICY "Users can view vendor assets in their company"
ON public.vendor_assets FOR SELECT
USING (
  asset_id IN (
    SELECT id FROM public.assets WHERE company_id = public.get_user_company(auth.uid())
  )
);

-- VENDOR_CONTRACTS: scope SELECT to user's company
DROP POLICY IF EXISTS "Users can view vendor contracts" ON public.vendor_contracts;

CREATE POLICY "Users can view vendor contracts in their company"
ON public.vendor_contracts FOR SELECT
USING (
  vendor_id IN (
    SELECT id FROM public.vendors WHERE company_id = public.get_user_company(auth.uid())
  )
);

-- VENDORS: add company-scope to insert/update policies
DROP POLICY IF EXISTS "Admins and managers can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins and managers can update vendors" ON public.vendors;

CREATE POLICY "Admins and managers can insert vendors in their company"
ON public.vendors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['administrator'::text, 'manager'::text])
  )
  AND company_id = public.get_user_company(auth.uid())
);

CREATE POLICY "Admins and managers can update vendors in their company"
ON public.vendors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['administrator'::text, 'manager'::text])
  )
  AND company_id = public.get_user_company(auth.uid())
)
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
);

-- PROFILES: remove admin-leak SELECT clause
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

-- Remove the redundant/buggy "Users cannot change their own role" UPDATE policy
-- (it is permissive and additive, so it actually ALLOWS unchanged-role updates only,
-- but combined with other UPDATE policies it adds confusion). Replace with a clean
-- restrictive policy that prevents users from changing their own role or company.
DROP POLICY IF EXISTS "Users cannot change their own role" ON public.profiles;

CREATE POLICY "Users cannot change their own role or company"
ON public.profiles AS RESTRICTIVE FOR UPDATE
USING (true)
WITH CHECK (
  id <> auth.uid()
  OR (
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);
