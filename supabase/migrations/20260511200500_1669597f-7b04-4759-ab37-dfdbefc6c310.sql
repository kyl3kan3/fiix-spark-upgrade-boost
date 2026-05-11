
-- Tighten profiles SELECT
DROP POLICY IF EXISTS "Profiles: view own or company" ON public.profiles;
CREATE POLICY "Profiles: view own or admin in company"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid()
  OR (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::app_role)
  )
);

-- Safe directory view for company peers (no email / phone_number)
CREATE OR REPLACE VIEW public.profiles_directory
WITH (security_invoker = off) AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.role,
  p.company_id,
  p.company_name,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE
  p.id = auth.uid()
  OR p.company_id = public.get_user_company(auth.uid());

REVOKE ALL ON public.profiles_directory FROM PUBLIC, anon;
GRANT SELECT ON public.profiles_directory TO authenticated;
