-- Harden tenant ownership, billing checkout attribution, public request uploads,
-- and checklist scheduling/submission boundaries.

-- ---------------------------------------------------------------------------
-- Company timezone and privileged profile transitions
-- ---------------------------------------------------------------------------

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';

CREATE OR REPLACE FUNCTION public.validate_company_timezone()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.timezone IS NULL OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names
    WHERE name = NEW.timezone
  ) THEN
    RAISE EXCEPTION 'Invalid IANA timezone: %', NEW.timezone;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_company_timezone() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_validate_company_timezone ON public.companies;
CREATE TRIGGER trg_validate_company_timezone
BEFORE INSERT OR UPDATE OF timezone ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.validate_company_timezone();

-- Profile role/company changes are blocked for direct client writes. Trusted
-- SECURITY DEFINER workflows opt in with a transaction-local marker.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_company_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _workflow text := pg_catalog.current_setting(
    'app.profile_privileged_update',
    true
  );
BEGIN
  IF auth.uid() IS NOT NULL
     AND COALESCE(_workflow, '') NOT IN ('owner_onboarding', 'accept_invitation') THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Changing profile role is not allowed';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Changing profile company is not allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_company_change() FROM PUBLIC;

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

  RETURN pg_catalog.jsonb_build_object(
    'company_id', _company_id,
    'created', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_owner_onboarding_with_timezone(
  text, text, text, text, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_owner_onboarding_with_timezone(
  text, text, text, text, text
) TO authenticated;

-- Keep the existing RPC signature for older clients, but route it through the
-- hardened implementation and use an explicit UTC default.
CREATE OR REPLACE FUNCTION public.complete_owner_onboarding(
  _company_name text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.complete_owner_onboarding_with_timezone(
    _company_name,
    _first_name,
    _last_name,
    _phone,
    'UTC'
  );
$$;

REVOKE ALL ON FUNCTION public.complete_owner_onboarding(
  text, text, text, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_owner_onboarding(
  text, text, text, text
) TO authenticated;

-- Recreate invitation acceptance so the profile guard permits only the
-- verified, row-locked invitation transition.
CREATE OR REPLACE FUNCTION public.accept_invitation(
  _token text,
  _first_name text DEFAULT NULL,
  _last_name text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _existing_company_id uuid;
  _inv public.organization_invitations%ROWTYPE;
  _role_enum public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  SELECT u.email INTO _email
  FROM auth.users AS u
  WHERE u.id = _uid;

  SELECT oi.* INTO _inv
  FROM public.organization_invitations AS oi
  WHERE oi.token = _token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF _inv.status <> 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer pending';
  END IF;

  IF _email IS NULL
     OR pg_catalog.lower(_inv.email) <> pg_catalog.lower(_email) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Invitation email does not match the signed-in user';
  END IF;

  SELECT p.company_id INTO _existing_company_id
  FROM public.profiles AS p
  WHERE p.id = _uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF _existing_company_id IS NOT NULL
     AND _existing_company_id <> _inv.organization_id THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'This account already belongs to another company';
  END IF;

  BEGIN
    _role_enum := _inv.role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    _role_enum := 'technician'::public.app_role;
  END;

  IF _role_enum = 'super_admin'::public.app_role THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Super administrator access cannot be granted by invitation';
  END IF;

  PERFORM pg_catalog.set_config(
    'app.profile_privileged_update',
    'accept_invitation',
    true
  );

  UPDATE public.profiles
  SET company_id = _inv.organization_id,
      role = _role_enum::text,
      first_name = COALESCE(NULLIF(pg_catalog.btrim(_first_name), ''), first_name),
      last_name = COALESCE(NULLIF(pg_catalog.btrim(_last_name), ''), last_name),
      phone_number = COALESCE(NULLIF(pg_catalog.btrim(_phone), ''), phone_number),
      updated_at = pg_catalog.now()
  WHERE id = _uid;

  PERFORM pg_catalog.set_config('app.profile_privileged_update', '', true);

  INSERT INTO public.user_roles (user_id, role, company_id, created_by)
  VALUES (_uid, _role_enum, _inv.organization_id, _inv.invited_by)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  UPDATE public.organization_invitations
  SET status = 'accepted', accepted_at = pg_catalog.now()
  WHERE id = _inv.id;

  RETURN pg_catalog.jsonb_build_object(
    'company_id', _inv.organization_id,
    'role', _role_enum::text,
    'invitation_id', _inv.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation(
  text, text, text, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(
  text, text, text, text
) TO authenticated;

-- ---------------------------------------------------------------------------
-- Server-issued authorization records
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.billing_checkout_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  expires_at timestamptz NOT NULL DEFAULT (pg_catalog.now() + interval '2 hours'),
  paddle_subscription_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX IF NOT EXISTS idx_billing_checkout_authorizations_company
  ON public.billing_checkout_authorizations(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_checkout_authorizations_expires
  ON public.billing_checkout_authorizations(expires_at);

ALTER TABLE public.billing_checkout_authorizations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.billing_checkout_authorizations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.billing_checkout_authorizations TO service_role;

CREATE TABLE IF NOT EXISTS public.public_request_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  upload_prefix text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (pg_catalog.now() + interval '15 minutes'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX IF NOT EXISTS idx_public_request_authorizations_expires
  ON public.public_request_authorizations(expires_at);

ALTER TABLE public.public_request_authorizations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.public_request_authorizations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.public_request_authorizations TO service_role;

-- Direct row/file insertion bypassed Turnstile. All anonymous request writes
-- now flow through Edge Functions using the service role and single-use rows.
DROP POLICY IF EXISTS "Anyone can submit a public request" ON public.public_requests;
REVOKE INSERT ON TABLE public.public_requests FROM anon, authenticated;

DROP POLICY IF EXISTS "Public request photos: constrained anon upload" ON storage.objects;

-- Defense in depth for signed upload URLs: Storage itself enforces the limit.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/*']::text[]
WHERE id = 'public-request-photos';

CREATE OR REPLACE FUNCTION public.create_public_request_from_authorization(
  _authorization_id uuid,
  _type text,
  _title text,
  _description text,
  _location_text text,
  _contact_name text,
  _contact_email text,
  _contact_phone text,
  _photo_paths jsonb,
  _user_agent text,
  _storage_base_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _authorization public.public_request_authorizations%ROWTYPE;
  _photos jsonb := '[]'::jsonb;
  _request_id uuid;
  _now timestamptz := pg_catalog.now();
BEGIN
  IF pg_catalog.jsonb_typeof(_photo_paths) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Photo paths must be a JSON array';
  END IF;

  IF pg_catalog.jsonb_array_length(_photo_paths) > 6 THEN
    RAISE EXCEPTION 'A request can include at most 6 photos';
  END IF;

  IF _storage_base_url IS NULL
     OR _storage_base_url !~ '^https://[^/]+/storage/v1/object/public/public-request-photos/$' THEN
    RAISE EXCEPTION 'Invalid storage base URL';
  END IF;

  UPDATE public.public_request_authorizations AS pra
  SET used_at = _now
  WHERE pra.id = _authorization_id
    AND pra.used_at IS NULL
    AND pra.expires_at > _now
  RETURNING pra.* INTO _authorization;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Request authorization is invalid, expired, or already used';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements_text(_photo_paths) AS photo(path)
    WHERE pg_catalog.left(
      photo.path,
      pg_catalog.length(_authorization.upload_prefix) + 1
    ) <> _authorization.upload_prefix || '/'
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'A photo path is outside the authorized upload folder';
  END IF;

  SELECT COALESCE(
    pg_catalog.jsonb_agg(pg_catalog.to_jsonb(_storage_base_url || photo.path)),
    '[]'::jsonb
  )
  INTO _photos
  FROM pg_catalog.jsonb_array_elements_text(_photo_paths) AS photo(path);

  INSERT INTO public.public_requests (
    company_id,
    type,
    title,
    description,
    location_text,
    contact_name,
    contact_email,
    contact_phone,
    photos,
    user_agent
  )
  VALUES (
    _authorization.company_id,
    _type,
    _title,
    COALESCE(_description, ''),
    NULLIF(_location_text, ''),
    NULLIF(_contact_name, ''),
    NULLIF(_contact_email, ''),
    NULLIF(_contact_phone, ''),
    _photos,
    NULLIF(_user_agent, '')
  )
  RETURNING id INTO _request_id;

  RETURN pg_catalog.jsonb_build_object(
    'request_id', _request_id,
    'company_id', _authorization.company_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_request_from_authorization(
  uuid, text, text, text, text, text, text, text, jsonb, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_request_from_authorization(
  uuid, text, text, text, text, text, text, text, jsonb, text, text
) TO service_role;

-- ---------------------------------------------------------------------------
-- Third-party provider credential isolation
-- ---------------------------------------------------------------------------

-- Analytics access and refresh tokens are handled only by Edge Functions.
-- Browser clients receive token-free metrics from those authenticated routes.
ALTER TABLE public.google_analytics_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_analytics_connections FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super admins can view ga connections"
  ON public.google_analytics_connections;
DROP POLICY IF EXISTS "super admins can modify ga connections"
  ON public.google_analytics_connections;
DROP POLICY IF EXISTS "Service role manages google analytics connections"
  ON public.google_analytics_connections;

REVOKE ALL ON TABLE public.google_analytics_connections
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.google_analytics_connections TO service_role;

CREATE POLICY "Service role manages google analytics connections"
ON public.google_analytics_connections
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Atomic, company-timezone-aware checklist scheduling
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.next_checklist_due(
  _frequency text,
  _from timestamptz,
  _timezone text
)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  _local_from timestamp without time zone;
  _local_next timestamp without time zone;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names
    WHERE name = _timezone
  ) THEN
    RAISE EXCEPTION 'Invalid IANA timezone: %', _timezone;
  END IF;

  _local_from := _from AT TIME ZONE _timezone;

  CASE _frequency
    WHEN 'twice-daily' THEN
      IF pg_catalog.date_part('hour', _local_from) < 12 THEN
        _local_next := pg_catalog.date_trunc('day', _local_from) + interval '12 hours';
      ELSE
        _local_next := pg_catalog.date_trunc('day', _local_from) + interval '1 day';
      END IF;
    WHEN 'daily' THEN
      _local_next := pg_catalog.date_trunc('day', _local_from) + interval '1 day';
    WHEN 'weekly' THEN
      _local_next := _local_from + interval '7 days';
    WHEN 'biweekly' THEN
      _local_next := _local_from + interval '14 days';
    WHEN 'monthly' THEN
      _local_next := _local_from + interval '1 month';
    WHEN 'quarterly' THEN
      _local_next := _local_from + interval '3 months';
    WHEN 'annually' THEN
      _local_next := _local_from + interval '1 year';
    ELSE
      RETURN NULL;
  END CASE;

  RETURN _local_next AT TIME ZONE _timezone;
END;
$$;

REVOKE ALL ON FUNCTION public.next_checklist_due(
  text, timestamptz, text
) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_checklist_schedule(
  _checklist_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _frequency text;
  _timezone text;
  _next_due_at timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  SELECT c.frequency, co.timezone
  INTO _frequency, _timezone
  FROM public.checklists AS c
  JOIN public.profiles AS p
    ON p.id = _uid
   AND p.company_id = c.company_id
  JOIN public.companies AS co
    ON co.id = c.company_id
  WHERE c.id = _checklist_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Checklist not found in the current company';
  END IF;

  _next_due_at := public.next_checklist_due(
    COALESCE(_frequency, 'one-time'),
    pg_catalog.now(),
    _timezone
  );

  INSERT INTO public.checklist_schedules (
    checklist_id,
    next_due_at,
    updated_at
  )
  VALUES (
    _checklist_id,
    _next_due_at,
    pg_catalog.now()
  )
  ON CONFLICT (checklist_id) DO UPDATE
  SET next_due_at = EXCLUDED.next_due_at,
      updated_at = EXCLUDED.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.set_checklist_schedule(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_checklist_schedule(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_checklist_atomic(
  _checklist_id uuid,
  _items jsonb,
  _notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _frequency text;
  _timezone text;
  _submitted_at timestamptz := pg_catalog.now();
  _submission public.checklist_submissions%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF pg_catalog.jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Checklist items must be a JSON array';
  END IF;

  IF pg_catalog.jsonb_array_length(_items) > 500 THEN
    RAISE EXCEPTION 'A checklist submission can include at most 500 responses';
  END IF;

  IF pg_catalog.octet_length(_items::text) > 1048576 THEN
    RAISE EXCEPTION 'Checklist response payload must be 1 MB or smaller';
  END IF;

  IF pg_catalog.length(COALESCE(_notes, '')) > 5000 THEN
    RAISE EXCEPTION 'Submission notes must be 5000 characters or fewer';
  END IF;

  SELECT c.frequency, co.timezone
  INTO _frequency, _timezone
  FROM public.checklists AS c
  JOIN public.profiles AS p
    ON p.id = _uid
   AND p.company_id = c.company_id
  JOIN public.companies AS co
    ON co.id = c.company_id
  WHERE c.id = _checklist_id
    AND c.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Active checklist not found in the current company';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_to_recordset(_items) AS item(
      item_id uuid,
      response_value text,
      is_checked boolean,
      notes text,
      asset_id uuid
    )
    LEFT JOIN public.checklist_items AS ci
      ON ci.id = item.item_id
     AND ci.checklist_id = _checklist_id
    WHERE ci.id IS NULL
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'A response does not belong to this checklist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_to_recordset(_items) AS item(
      item_id uuid,
      response_value text,
      is_checked boolean,
      notes text,
      asset_id uuid
    )
    WHERE item.asset_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.checklist_assets AS ca
        WHERE ca.checklist_id = _checklist_id
          AND ca.asset_id = item.asset_id
      )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'A response asset is not linked to this checklist';
  END IF;

  INSERT INTO public.checklist_submissions (
    checklist_id,
    submitted_by,
    submitted_at,
    notes
  )
  VALUES (
    _checklist_id,
    _uid,
    _submitted_at,
    NULLIF(_notes, '')
  )
  RETURNING * INTO _submission;

  INSERT INTO public.checklist_submission_items (
    submission_id,
    checklist_item_id,
    response_value,
    is_checked,
    notes,
    asset_id
  )
  SELECT
    _submission.id,
    item.item_id,
    item.response_value,
    item.is_checked,
    item.notes,
    item.asset_id
  FROM pg_catalog.jsonb_to_recordset(_items) AS item(
    item_id uuid,
    response_value text,
    is_checked boolean,
    notes text,
    asset_id uuid
  );

  INSERT INTO public.checklist_schedules (
    checklist_id,
    next_due_at,
    last_submitted_at,
    updated_at
  )
  VALUES (
    _checklist_id,
    public.next_checklist_due(
      COALESCE(_frequency, 'one-time'),
      _submitted_at,
      _timezone
    ),
    _submitted_at,
    _submitted_at
  )
  ON CONFLICT (checklist_id) DO UPDATE
  SET next_due_at = EXCLUDED.next_due_at,
      last_submitted_at = EXCLUDED.last_submitted_at,
      updated_at = EXCLUDED.updated_at;

  RETURN pg_catalog.to_jsonb(_submission);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_checklist_atomic(
  uuid, jsonb, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_checklist_atomic(
  uuid, jsonb, text
) TO authenticated;

-- Preserve PGMQ enqueue timestamps so queue TTL enforcement can use its
-- documented fallback when a payload predates the queued_at field.
DROP FUNCTION IF EXISTS public.read_email_batch(text, integer, integer);
CREATE FUNCTION public.read_email_batch(
  queue_name text,
  batch_size integer,
  vt integer
)
RETURNS TABLE(
  msg_id bigint,
  read_ct integer,
  enqueued_at timestamptz,
  message jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT r.msg_id, r.read_ct, r.enqueued_at, r.message
  FROM pgmq.read(queue_name, vt, batch_size) AS r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.read_email_batch(
  text, integer, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_email_batch(
  text, integer, integer
) TO service_role;

NOTIFY pgrst, 'reload schema';
