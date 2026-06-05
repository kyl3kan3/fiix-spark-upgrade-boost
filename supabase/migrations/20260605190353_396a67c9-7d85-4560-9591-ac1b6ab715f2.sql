
-- 1) Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2) google_ads_connections: keep all client access denied (no policies),
--    expose a safe, token-free summary to company admins via SECURITY DEFINER.
REVOKE ALL ON public.google_ads_connections FROM anon, authenticated;
GRANT ALL ON public.google_ads_connections TO service_role;

CREATE OR REPLACE FUNCTION public.get_google_ads_connection_status()
RETURNS TABLE(
  id uuid,
  company_id uuid,
  connected_by uuid,
  login_customer_id text,
  customer_id text,
  account_descriptive_name text,
  scope text,
  token_expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.company_id, g.connected_by, g.login_customer_id, g.customer_id,
         g.account_descriptive_name, g.scope, g.token_expires_at, g.created_at, g.updated_at
  FROM public.google_ads_connections g
  WHERE g.company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.get_google_ads_connection_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_google_ads_connection_status() TO authenticated;
