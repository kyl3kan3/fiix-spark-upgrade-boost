
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.google_ads_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  connected_by uuid NOT NULL,
  refresh_token text NOT NULL,
  access_token text,
  token_expires_at timestamptz,
  login_customer_id text,
  customer_id text,
  account_descriptive_name text,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_ads_connections TO authenticated;
GRANT ALL ON public.google_ads_connections TO service_role;

ALTER TABLE public.google_ads_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view google ads connections"
ON public.google_ads_connections FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins insert google ads connections"
ON public.google_ads_connections FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins update google ads connections"
ON public.google_ads_connections FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins delete google ads connections"
ON public.google_ads_connections FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_google_ads_connections_updated_at
BEFORE UPDATE ON public.google_ads_connections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TABLE public.google_ads_oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.google_ads_oauth_states TO service_role;
ALTER TABLE public.google_ads_oauth_states ENABLE ROW LEVEL SECURITY;
