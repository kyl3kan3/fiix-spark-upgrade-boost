DROP FUNCTION IF EXISTS public.get_invitation_by_token(text);
CREATE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE(
  id uuid,
  email text,
  status text,
  organization_id uuid,
  role text,
  created_at timestamp with time zone,
  company_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT i.id, i.email, i.status, i.organization_id, i.role, i.created_at,
         c.name AS company_name
  FROM public.organization_invitations i
  LEFT JOIN public.companies c ON c.id = i.organization_id
  WHERE i.token = _token
  LIMIT 1;
$$;