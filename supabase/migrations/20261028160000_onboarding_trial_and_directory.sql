-- Start a 7-day Pro trial when an owner completes onboarding; dedupe company directory rows.

CREATE OR REPLACE FUNCTION public.get_company_directory()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
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
  SELECT DISTINCT ON (p.id)
    p.id, p.first_name, p.last_name, p.email, p.avatar_url, p.role,
    p.company_id, p.company_name, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.company_id = public.get_user_company(auth.uid())
  ORDER BY p.id, p.updated_at DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_company_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_company_directory() TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_owner_onboarding_with_timezone(
  _company_name text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _timezone text DEFAULT 'UTC'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _company_id uuid;
  _existing_company_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF NULLIF(pg_catalog.btrim(_company_name), '') IS NULL THEN
    RAISE EXCEPTION 'Company name is required';
  END IF;

  IF pg_catalog.length(pg_catalog.btrim(_company_name)) > 200 THEN
    RAISE EXCEPTION 'Company name must be 200 characters or fewer';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names
    WHERE name = COALESCE(NULLIF(_timezone, ''), 'UTC')
  ) THEN
    RAISE EXCEPTION 'Invalid IANA timezone: %', _timezone;
  END IF;

  SELECT p.email, p.company_id
  INTO _email, _existing_company_id
  FROM public.profiles AS p
  WHERE p.id = _uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF _existing_company_id IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'This account already belongs to a company';
  END IF;

  INSERT INTO public.companies (name, created_by, email, timezone)
  VALUES (
    pg_catalog.btrim(_company_name),
    _uid,
    NULLIF(pg_catalog.btrim(_email), ''),
    COALESCE(NULLIF(_timezone, ''), 'UTC')
  )
  RETURNING id INTO _company_id;

  INSERT INTO public.organizations (id, name)
  VALUES (_company_id, pg_catalog.btrim(_company_name))
  ON CONFLICT (id) DO NOTHING;

  PERFORM pg_catalog.set_config(
    'app.profile_privileged_update',
    'owner_onboarding',
    true
  );

  UPDATE public.profiles
  SET company_id = _company_id,
      role = 'administrator',
      first_name = COALESCE(NULLIF(pg_catalog.btrim(_first_name), ''), first_name),
      last_name = COALESCE(NULLIF(pg_catalog.btrim(_last_name), ''), last_name),
      phone_number = COALESCE(NULLIF(pg_catalog.btrim(_phone), ''), phone_number),
      updated_at = pg_catalog.now()
  WHERE id = _uid;

  PERFORM pg_catalog.set_config('app.profile_privileged_update', '', true);

  INSERT INTO public.user_roles (user_id, role, company_id, created_by)
  VALUES (_uid, 'administrator'::public.app_role, _company_id, _uid)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  INSERT INTO public.subscriptions (
    company_id,
    tier,
    status,
    trial_ends_at,
    included_seats
  )
  VALUES (
    _company_id,
    'pro'::public.subscription_tier,
    'trialing'::public.subscription_status,
    pg_catalog.now() + interval '7 days',
    2
  )
  ON CONFLICT (company_id) DO NOTHING;

  RETURN pg_catalog.jsonb_build_object(
    'company_id', _company_id,
    'created', true
  );
END;
$$;
