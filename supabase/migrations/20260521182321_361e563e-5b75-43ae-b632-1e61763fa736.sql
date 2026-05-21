CREATE OR REPLACE FUNCTION public.complete_owner_onboarding(
  _company_name text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _company_id uuid;
  _existing_company_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NULLIF(trim(_company_name), '') IS NULL THEN
    RAISE EXCEPTION 'Company name is required';
  END IF;

  SELECT email INTO _email
  FROM public.profiles
  WHERE id = _uid;

  SELECT company_id INTO _existing_company_id
  FROM public.profiles
  WHERE id = _uid;

  IF _existing_company_id IS NOT NULL THEN
    UPDATE public.profiles
    SET first_name = COALESCE(NULLIF(trim(_first_name), ''), first_name),
        last_name = COALESCE(NULLIF(trim(_last_name), ''), last_name),
        phone_number = COALESCE(NULLIF(trim(_phone), ''), phone_number),
        updated_at = now()
    WHERE id = _uid;

    INSERT INTO public.user_roles (user_id, role, company_id, created_by)
    VALUES (_uid, 'administrator'::public.app_role, _existing_company_id, _uid)
    ON CONFLICT (user_id, role, company_id) DO NOTHING;

    RETURN jsonb_build_object(
      'company_id', _existing_company_id,
      'created', false
    );
  END IF;

  INSERT INTO public.companies (name, created_by, email)
  VALUES (trim(_company_name), _uid, NULLIF(trim(_email), ''))
  RETURNING id INTO _company_id;

  INSERT INTO public.organizations (id, name)
  VALUES (_company_id, trim(_company_name))
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.profiles
  SET company_id = _company_id,
      role = 'administrator',
      first_name = COALESCE(NULLIF(trim(_first_name), ''), first_name),
      last_name = COALESCE(NULLIF(trim(_last_name), ''), last_name),
      phone_number = COALESCE(NULLIF(trim(_phone), ''), phone_number),
      updated_at = now()
  WHERE id = _uid;

  INSERT INTO public.user_roles (user_id, role, company_id, created_by)
  VALUES (_uid, 'administrator'::public.app_role, _company_id, _uid)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  RETURN jsonb_build_object(
    'company_id', _company_id,
    'created', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_owner_onboarding(text, text, text, text) TO authenticated;