CREATE OR REPLACE FUNCTION public.accept_invitation(
  _token text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _inv RECORD;
  _role_enum public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  SELECT * INTO _inv
  FROM public.organization_invitations
  WHERE token = _token
  LIMIT 1;

  IF _inv IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF _inv.status <> 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer pending';
  END IF;

  IF lower(_inv.email) <> lower(_email) THEN
    RAISE EXCEPTION 'Invitation email does not match the signed-in user';
  END IF;

  -- Map invitation role text to app_role enum (default technician)
  BEGIN
    _role_enum := _inv.role::public.app_role;
  EXCEPTION WHEN others THEN
    _role_enum := 'technician'::public.app_role;
  END;

  -- Link profile to company + role (bypasses restrictive RLS via SECURITY DEFINER)
  UPDATE public.profiles
  SET company_id = _inv.organization_id,
      role = _inv.role,
      first_name = COALESCE(NULLIF(_first_name, ''), first_name),
      last_name  = COALESCE(NULLIF(_last_name, ''), last_name),
      phone_number = COALESCE(NULLIF(_phone, ''), phone_number),
      updated_at = now()
  WHERE id = _uid;

  -- Ensure user_roles entry exists
  INSERT INTO public.user_roles (user_id, role, company_id, created_by)
  VALUES (_uid, _role_enum, _inv.organization_id, _inv.invited_by)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  -- Mark invitation accepted
  UPDATE public.organization_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = _inv.id;

  RETURN jsonb_build_object(
    'company_id', _inv.organization_id,
    'role', _inv.role,
    'invitation_id', _inv.id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(text, text, text, text) TO authenticated;