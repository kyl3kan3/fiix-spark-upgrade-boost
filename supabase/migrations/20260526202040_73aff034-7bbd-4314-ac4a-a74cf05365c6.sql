
-- Fix anonymous upload policy on public-request-photos bucket
DROP POLICY IF EXISTS "Public request photos: constrained anon upload" ON storage.objects;

CREATE POLICY "Public request photos: constrained anon upload"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'public-request-photos'
  AND COALESCE(metadata->>'mimetype', '') LIKE 'image/%'
  AND COALESCE((metadata->>'size')::bigint, 0) <= 10485760
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id::text = (storage.foldername(name))[1]
  )
);

-- Allow administrators to update work orders in their company
DROP POLICY IF EXISTS "Users can update work orders they own or are assigned to" ON public.work_orders;

CREATE POLICY "Members can update work orders in their company"
ON public.work_orders
FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company(auth.uid())
  AND (
    auth.uid() = created_by
    OR auth.uid() = assigned_to
    OR has_role(auth.uid(), 'administrator'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  )
)
WITH CHECK (
  company_id = get_user_company(auth.uid())
  AND (
    auth.uid() = created_by
    OR auth.uid() = assigned_to
    OR has_role(auth.uid(), 'administrator'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);
