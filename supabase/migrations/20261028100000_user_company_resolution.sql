-- Resolve company from user_roles when profiles.company_id is still null (post-invite / onboarding).

CREATE OR REPLACE FUNCTION public.get_user_company(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.company_id FROM public.profiles p WHERE p.id = _user_id),
    (
      SELECT ur.company_id
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
      ORDER BY ur.created_at DESC NULLS LAST
      LIMIT 1
    )
  );
$$;

UPDATE public.profiles p
SET company_id = ur.company_id
FROM (
  SELECT DISTINCT ON (user_id) user_id, company_id
  FROM public.user_roles
  WHERE company_id IS NOT NULL
  ORDER BY user_id, created_at DESC NULLS LAST
) ur
WHERE p.id = ur.user_id
  AND p.company_id IS NULL;

NOTIFY pgrst, 'reload schema';
