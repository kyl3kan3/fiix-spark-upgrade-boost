
-- 1) Tighten storage policies for public-request-photos
DROP POLICY IF EXISTS "Anyone can upload request photos" ON storage.objects;
DROP POLICY IF EXISTS "Company members can delete request photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view request photos" ON storage.objects;

-- INSERT: anon allowed, but must be image/*, <= 10MB, and path must start with an existing company_id
CREATE POLICY "Public request photos: constrained anon upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'public-request-photos'
  AND coalesce((metadata->>'mimetype'), '') LIKE 'image/%'
  AND coalesce((metadata->>'size')::bigint, 0) <= 10485760
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id::text = (storage.foldername(name))[1]
  )
);

-- DELETE: only admins of the company that owns the folder
CREATE POLICY "Public request photos: company admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-request-photos'
  AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

-- SELECT: company members can list/read their own company's photos
-- (Public URL endpoint still works for the public bucket so existing emails/links keep working.)
CREATE POLICY "Public request photos: company members can read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'public-request-photos'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

-- 2) Fix work_order_comments policies to use work_orders.company_id directly
DROP POLICY IF EXISTS "Users can view comments in their company" ON public.work_order_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.work_order_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.work_order_comments;

CREATE POLICY "Users can view comments in their company"
ON public.work_order_comments FOR SELECT
TO authenticated
USING (
  work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.company_id = public.get_user_company(auth.uid())
  )
);

CREATE POLICY "Users can create comments"
ON public.work_order_comments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.company_id = public.get_user_company(auth.uid())
  )
);

CREATE POLICY "Users can update their own comments"
ON public.work_order_comments FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.company_id = public.get_user_company(auth.uid())
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.company_id = public.get_user_company(auth.uid())
  )
);
