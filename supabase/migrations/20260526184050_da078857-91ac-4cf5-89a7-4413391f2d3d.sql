
-- Fix 1: Allow checklist admins/managers (not just creator) to manage items
DROP POLICY IF EXISTS "Users can manage checklist items for their checklists" ON public.checklist_items;

CREATE POLICY "Creators or admins/managers can manage checklist items"
ON public.checklist_items
FOR ALL
TO authenticated
USING (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.created_by = auth.uid()
       OR (
         c.company_id = public.get_user_company(auth.uid())
         AND (
           public.has_role(auth.uid(), 'administrator'::app_role)
           OR public.has_role(auth.uid(), 'manager'::app_role)
           OR public.has_role(auth.uid(), 'super_admin'::app_role)
         )
       )
  )
)
WITH CHECK (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.created_by = auth.uid()
       OR (
         c.company_id = public.get_user_company(auth.uid())
         AND (
           public.has_role(auth.uid(), 'administrator'::app_role)
           OR public.has_role(auth.uid(), 'manager'::app_role)
           OR public.has_role(auth.uid(), 'super_admin'::app_role)
         )
       )
  )
);

-- Fix 2: google_ads_oauth_states is only accessed by edge functions (service_role).
-- Add explicit service_role policy; deny all other access (RLS stays enabled).
CREATE POLICY "Service role manages oauth states"
ON public.google_ads_oauth_states
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix 3: Restrict marketing_leads SELECT/DELETE to platform super_admin only.
-- These are global marketing leads from the public landing page, not tenant data.
DROP POLICY IF EXISTS "Admins can view leads" ON public.marketing_leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.marketing_leads;

CREATE POLICY "Super admins can view leads"
ON public.marketing_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete leads"
ON public.marketing_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Fix 4: Correct the broken company existence check in the public request photos upload policy.
DROP POLICY IF EXISTS "Public request photos: constrained anon upload" ON storage.objects;

CREATE POLICY "Public request photos: constrained anon upload"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'public-request-photos'
  AND COALESCE((metadata ->> 'mimetype'), '') LIKE 'image/%'
  AND COALESCE((metadata ->> 'size')::bigint, 0) <= 10485760
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id::text = (storage.foldername(name))[1]
  )
);
