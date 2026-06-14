-- 1. Harden is_super_admin to also require the JWT email match the single internal address.
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'super_admin'::public.app_role
  )
  AND lower(coalesce((auth.jwt() ->> 'email')::text, '')) = 'kyle@decent4.com';
$$;

-- 2. Replace marketing_leads policies that use has_role(_,'super_admin')
--    with the hardened is_super_admin(auth.uid()) check.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'marketing_leads'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.marketing_leads', pol.policyname);
  END LOOP;
END $$;

-- Public can submit a marketing lead (form on the website).
CREATE POLICY "Anyone can submit a marketing lead"
  ON public.marketing_leads
  FOR INSERT
  WITH CHECK (true);

-- Only the hardened super_admin can read/update/delete leads.
CREATE POLICY "Super admin can read marketing leads"
  ON public.marketing_leads
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update marketing leads"
  ON public.marketing_leads
  FOR UPDATE
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete marketing leads"
  ON public.marketing_leads
  FOR DELETE
  USING (public.is_super_admin(auth.uid()));

-- 3. Force profiles.role to 'technician' on any INSERT coming from a logged-in
--    user (service_role and SECURITY DEFINER functions are unaffected). The
--    authoritative role store remains public.user_roles.
CREATE OR REPLACE FUNCTION public.force_default_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.role() <> 'service_role' THEN
    NEW.role := 'technician';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS force_default_profile_role_trg ON public.profiles;
CREATE TRIGGER force_default_profile_role_trg
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.force_default_profile_role();