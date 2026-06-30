
CREATE TABLE IF NOT EXISTS public.google_analytics_oauth_states (
  state TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.google_analytics_oauth_states TO service_role;
ALTER TABLE public.google_analytics_oauth_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only ga oauth states"
  ON public.google_analytics_oauth_states FOR ALL
  USING (false) WITH CHECK (false);

CREATE TABLE IF NOT EXISTS public.google_analytics_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  connected_by UUID NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  property_id TEXT,
  property_display_name TEXT,
  account_display_name TEXT,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_analytics_connections TO authenticated;
GRANT ALL ON public.google_analytics_connections TO service_role;
ALTER TABLE public.google_analytics_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins can view ga connections"
  ON public.google_analytics_connections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admins can modify ga connections"
  ON public.google_analytics_connections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
