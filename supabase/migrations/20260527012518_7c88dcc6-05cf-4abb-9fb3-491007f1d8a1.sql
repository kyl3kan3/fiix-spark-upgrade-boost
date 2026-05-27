
-- 1) Fix public-request-photos upload policy: reference uploaded object's name, not c.name
DROP POLICY IF EXISTS "Public request photos: constrained anon upload" ON storage.objects;
CREATE POLICY "Public request photos: constrained anon upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'public-request-photos'
  AND COALESCE((metadata->>'mimetype'), '') LIKE 'image/%'
  AND COALESCE((metadata->>'size')::bigint, 0) <= 10485760
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id::text = (storage.foldername(name))[1]
  )
);

-- 2) Restrict public_requests SELECT to admins and managers (PII protection)
DROP POLICY IF EXISTS "Users can view public requests in their company" ON public.public_requests;
DROP POLICY IF EXISTS "Members can view public requests" ON public.public_requests;
DROP POLICY IF EXISTS "Company members can view public requests" ON public.public_requests;
DROP POLICY IF EXISTS "Users view company public requests" ON public.public_requests;

CREATE POLICY "Admins and managers can view public requests"
ON public.public_requests
FOR SELECT
TO authenticated
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    public.has_role(auth.uid(), 'administrator'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

-- 3) Add restrictive policy on user_roles to block self-grant of privileged roles
-- Bootstrap goes through SECURITY DEFINER RPCs (complete_owner_onboarding, accept_invitation)
-- which run as service-definer and bypass RLS. Direct user-context writes are blocked unless
-- the actor is already an admin AND is not granting themselves super_admin.
CREATE POLICY "Block self-grant of privileged roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  -- Cannot grant super_admin via user context at all
  role <> 'super_admin'::public.app_role
  -- Cannot grant administrator to yourself
  AND NOT (user_id = auth.uid() AND role = 'administrator'::public.app_role)
);

CREATE POLICY "Block self-update to privileged roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  role <> 'super_admin'::public.app_role
  AND NOT (user_id = auth.uid() AND role = 'administrator'::public.app_role)
);

-- 4) Fix mutable search_path on pgmq wrapper functions
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
