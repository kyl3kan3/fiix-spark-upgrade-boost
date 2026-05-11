
DROP VIEW IF EXISTS public.profiles_directory;

CREATE OR REPLACE FUNCTION public.get_company_directory()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  role text,
  company_id uuid,
  company_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.last_name, p.avatar_url, p.role,
         p.company_id, p.company_name, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.company_id = public.get_user_company(auth.uid())
     OR p.id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_company_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_company_directory() TO authenticated;
