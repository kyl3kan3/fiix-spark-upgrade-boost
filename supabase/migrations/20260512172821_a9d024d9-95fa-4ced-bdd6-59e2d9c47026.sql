CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE (
  id uuid,
  email text,
  status text,
  organization_id uuid,
  role text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, status, organization_id, role, created_at
  FROM public.organization_invitations
  WHERE token = _token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated;