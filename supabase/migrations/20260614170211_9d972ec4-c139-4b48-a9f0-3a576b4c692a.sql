
-- Restrict marketing_page_events admin access to super_admin only (global marketing analytics)
DROP POLICY IF EXISTS "Admins can view marketing events" ON public.marketing_page_events;
DROP POLICY IF EXISTS "Admins can delete marketing events" ON public.marketing_page_events;

CREATE POLICY "Super admins can view marketing events"
ON public.marketing_page_events
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete marketing events"
ON public.marketing_page_events
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Harden google_ads_connections: force RLS and add explicit super-admin-only read policy.
-- Application reads go through SECURITY DEFINER function get_google_ads_connection_status();
-- writes happen via service role in edge functions.
ALTER TABLE public.google_ads_connections FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view google ads connections" ON public.google_ads_connections;
CREATE POLICY "Super admins can view google ads connections"
ON public.google_ads_connections
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));
