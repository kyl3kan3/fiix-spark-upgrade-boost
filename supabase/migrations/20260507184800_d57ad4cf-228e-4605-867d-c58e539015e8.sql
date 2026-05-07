
-- 1. Drop duplicate permissive storage policies on asset-images
DROP POLICY IF EXISTS "asset-images authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "asset-images authenticated upload" ON storage.objects;

-- 2. Notification preferences DELETE policy
CREATE POLICY "Users can delete their own notification preferences"
ON public.notification_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Work orders UPDATE - require same company
DROP POLICY IF EXISTS "Users can update work orders they own or are assigned to" ON public.work_orders;
CREATE POLICY "Users can update work orders they own or are assigned to"
ON public.work_orders
FOR UPDATE
USING (
  (auth.uid() = created_by OR auth.uid() = assigned_to)
  AND created_by IN (
    SELECT id FROM public.profiles WHERE company_id = public.get_user_company(auth.uid())
  )
)
WITH CHECK (
  (auth.uid() = created_by OR auth.uid() = assigned_to)
  AND created_by IN (
    SELECT id FROM public.profiles WHERE company_id = public.get_user_company(auth.uid())
  )
);

-- 4. has_role: scope to caller's current company to prevent cross-company privilege escalation
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND ur.company_id = p.company_id
  )
$function$;

-- 5. Revoke EXECUTE on internal trigger helper functions (they should only be called by triggers)
REVOKE EXECUTE ON FUNCTION public.update_daily_logs_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_onboarding_progress_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_sessions_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_settings_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_work_orders_updated_at() FROM anon, authenticated, PUBLIC;
