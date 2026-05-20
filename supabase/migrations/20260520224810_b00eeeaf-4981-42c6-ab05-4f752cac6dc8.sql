
-- has_feature(): server-side tier gate
CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier public.subscription_tier;
  _status public.subscription_status;
BEGIN
  IF _company_id IS NULL THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company_id;
  IF _tier IS NULL THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  RETURN CASE _feature
    WHEN 'analytics'   THEN _tier IN ('pro','business')
    WHEN 'automations' THEN _tier IN ('pro','business')
    WHEN 'api'         THEN _tier = 'business'
    WHEN 'sso'         THEN _tier = 'business'
    ELSE false
  END;
END;
$$;

-- API Keys table (Business tier feature)
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  created_by uuid NOT NULL,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_keys_company ON public.api_keys(company_id);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins of a company with the 'api' feature can manage keys
CREATE POLICY "Admins with api feature can view api keys"
  ON public.api_keys FOR SELECT
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::app_role)
    AND public.has_feature(company_id, 'api')
  );

CREATE POLICY "Admins with api feature can create api keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND created_by = auth.uid()
    AND public.has_role(auth.uid(), 'administrator'::app_role)
    AND public.has_feature(company_id, 'api')
  );

CREATE POLICY "Admins with api feature can revoke api keys"
  ON public.api_keys FOR UPDATE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::app_role)
    AND public.has_feature(company_id, 'api')
  );

CREATE POLICY "Admins with api feature can delete api keys"
  ON public.api_keys FOR DELETE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::app_role)
    AND public.has_feature(company_id, 'api')
  );
