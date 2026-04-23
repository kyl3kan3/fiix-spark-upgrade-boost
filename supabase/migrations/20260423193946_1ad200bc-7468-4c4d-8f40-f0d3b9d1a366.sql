
-- 1. system_settings: drop overly broad policies
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON public.system_settings;

-- 2. notification_preferences: add INSERT policy
CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. vendor_contracts: replace profile-role-based policy with has_role()
DROP POLICY IF EXISTS "Admins and managers can manage vendor contracts" ON public.vendor_contracts;

CREATE POLICY "Admins and managers can manage vendor contracts"
ON public.vendor_contracts
FOR ALL
USING (
  (public.has_role(auth.uid(), 'administrator'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role))
  AND vendor_id IN (
    SELECT id FROM public.vendors
    WHERE company_id = public.get_user_company(auth.uid())
  )
)
WITH CHECK (
  (public.has_role(auth.uid(), 'administrator'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role))
  AND vendor_id IN (
    SELECT id FROM public.vendors
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

-- Also tighten vendor_assets similarly
DROP POLICY IF EXISTS "Admins and managers can manage vendor assets" ON public.vendor_assets;

CREATE POLICY "Admins and managers can manage vendor assets"
ON public.vendor_assets
FOR ALL
USING (
  (public.has_role(auth.uid(), 'administrator'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role))
  AND asset_id IN (
    SELECT id FROM public.assets
    WHERE company_id = public.get_user_company(auth.uid())
  )
)
WITH CHECK (
  (public.has_role(auth.uid(), 'administrator'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role))
  AND asset_id IN (
    SELECT id FROM public.assets
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

-- 4. Realtime messages access control via RLS already covers REPLICA IDENTITY filtering
-- Ensure messages table RLS is enabled (already set). Realtime respects the SELECT policy.
ALTER TABLE public.messages REPLICA IDENTITY FULL;
