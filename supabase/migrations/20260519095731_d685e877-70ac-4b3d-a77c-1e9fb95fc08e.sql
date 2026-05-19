
-- 1) Tighten subscriptions SELECT to admins only (sensitive Paddle IDs)
DROP POLICY IF EXISTS "Members can view company subscription" ON public.subscriptions;
CREATE POLICY "Admins can view company subscription"
ON public.subscriptions
FOR SELECT
USING (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::public.app_role)
);

-- 2) Allow same-company members to view colleague profiles
DROP POLICY IF EXISTS "Profiles: view own or admin in company" ON public.profiles;
CREATE POLICY "Profiles: view own or company member"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid()
  OR company_id = public.get_user_company(auth.uid())
);

-- 3) Storage policies for the private asset-images bucket
-- Path convention: {uploader_user_id}/{folder}/{uuid}.{ext}
DROP POLICY IF EXISTS "asset-images: company members can read" ON storage.objects;
CREATE POLICY "asset-images: company members can read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (
    -- uploader themselves
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- any member of the same company as the uploader
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.company_id = public.get_user_company(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "asset-images: uploader can insert" ON storage.objects;
CREATE POLICY "asset-images: uploader can insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "asset-images: uploader can update" ON storage.objects;
CREATE POLICY "asset-images: uploader can update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "asset-images: uploader or admin can delete" ON storage.objects;
CREATE POLICY "asset-images: uploader or admin can delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
);
