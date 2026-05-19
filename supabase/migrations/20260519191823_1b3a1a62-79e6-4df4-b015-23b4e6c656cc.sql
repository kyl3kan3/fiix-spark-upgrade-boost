
-- 1. Add public_slug to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS public_slug text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_companies_public_slug ON public.companies(public_slug);

-- 2. Backfill slugs for existing companies
UPDATE public.companies
SET public_slug = lower(
  regexp_replace(
    regexp_replace(coalesce(name, 'company') || '-' || substr(id::text, 1, 4), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  )
)
WHERE public_slug IS NULL;

-- 3. Helper: auto-generate slug on company insert if missing
CREATE OR REPLACE FUNCTION public.set_company_public_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _base text;
  _candidate text;
  _suffix text;
  _exists boolean;
BEGIN
  IF NEW.public_slug IS NOT NULL AND length(trim(NEW.public_slug)) > 0 THEN
    RETURN NEW;
  END IF;

  _base := lower(regexp_replace(coalesce(NEW.name, 'company'), '[^a-zA-Z0-9]+', '-', 'g'));
  _base := regexp_replace(_base, '(^-+|-+$)', '', 'g');
  IF length(_base) = 0 THEN _base := 'company'; END IF;
  _candidate := _base;

  FOR i IN 1..5 LOOP
    SELECT EXISTS(SELECT 1 FROM public.companies WHERE public_slug = _candidate) INTO _exists;
    EXIT WHEN NOT _exists;
    _suffix := lower(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    _candidate := _base || '-' || _suffix;
  END LOOP;

  NEW.public_slug := _candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_company_public_slug ON public.companies;
CREATE TRIGGER trg_set_company_public_slug
BEFORE INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.set_company_public_slug();

-- 4. Public requests table
CREATE TABLE IF NOT EXISTS public.public_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'standard',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location_text text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'new',
  submitter_ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT public_requests_type_check CHECK (type IN ('standard','urgent')),
  CONSTRAINT public_requests_status_check CHECK (status IN ('new','in_progress','resolved')),
  CONSTRAINT public_requests_title_len CHECK (length(title) BETWEEN 1 AND 200),
  CONSTRAINT public_requests_description_len CHECK (length(description) <= 5000),
  CONSTRAINT public_requests_location_len CHECK (location_text IS NULL OR length(location_text) <= 300),
  CONSTRAINT public_requests_name_len CHECK (contact_name IS NULL OR length(contact_name) <= 120),
  CONSTRAINT public_requests_email_len CHECK (contact_email IS NULL OR length(contact_email) <= 255),
  CONSTRAINT public_requests_phone_len CHECK (contact_phone IS NULL OR length(contact_phone) <= 40)
);

CREATE INDEX IF NOT EXISTS idx_public_requests_company_status ON public.public_requests(company_id, status, created_at desc);
CREATE INDEX IF NOT EXISTS idx_public_requests_company_type ON public.public_requests(company_id, type, created_at desc);

ALTER TABLE public.public_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a request (length caps enforced via CHECKs above)
CREATE POLICY "Anyone can submit a public request"
ON public.public_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  company_id IS NOT NULL
  AND status = 'new'
  AND type IN ('standard','urgent')
);

-- Company members view their requests
CREATE POLICY "Members view their company requests"
ON public.public_requests
FOR SELECT
TO authenticated
USING (company_id = get_user_company(auth.uid()));

-- Company members update their requests
CREATE POLICY "Members update their company requests"
ON public.public_requests
FOR UPDATE
TO authenticated
USING (company_id = get_user_company(auth.uid()))
WITH CHECK (company_id = get_user_company(auth.uid()));

-- Admins delete
CREATE POLICY "Admins delete company requests"
ON public.public_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'administrator'::app_role) AND company_id = get_user_company(auth.uid()));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_public_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_public_requests_updated_at ON public.public_requests;
CREATE TRIGGER trg_public_requests_updated_at
BEFORE UPDATE ON public.public_requests
FOR EACH ROW EXECUTE FUNCTION public.update_public_requests_updated_at();

-- Dispatch notification on urgent requests
CREATE OR REPLACE FUNCTION public.public_requests_notify_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'urgent' THEN
    PERFORM public.dispatch_notification_event(
      'urgent_public_request',
      jsonb_build_object(
        'request_id', NEW.id,
        'company_id', NEW.company_id,
        'title', NEW.title,
        'description', NEW.description,
        'location', NEW.location_text,
        'contact_name', NEW.contact_name,
        'contact_email', NEW.contact_email,
        'contact_phone', NEW.contact_phone
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_public_requests_notify ON public.public_requests;
CREATE TRIGGER trg_public_requests_notify
AFTER INSERT ON public.public_requests
FOR EACH ROW EXECUTE FUNCTION public.public_requests_notify_trigger();

-- Public lookup function: resolve slug to company without exposing the companies table publicly
CREATE OR REPLACE FUNCTION public.get_public_company_by_slug(_slug text)
RETURNS TABLE(id uuid, name text, logo text, public_slug text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.logo, c.public_slug
  FROM public.companies c
  WHERE c.public_slug = _slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_company_by_slug(text) TO anon, authenticated;
