-- Allow company-folder uploads/reads on asset-images bucket (gallery uploader uses {companyId}/... paths)

DROP POLICY IF EXISTS "asset-images: company folder insert" ON storage.objects;
CREATE POLICY "asset-images: company folder insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

DROP POLICY IF EXISTS "asset-images: company folder select" ON storage.objects;
CREATE POLICY "asset-images: company folder select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

DROP POLICY IF EXISTS "asset-images: company folder update" ON storage.objects;
CREATE POLICY "asset-images: company folder update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
)
WITH CHECK (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
);

DROP POLICY IF EXISTS "asset-images: company folder delete" ON storage.objects;
CREATE POLICY "asset-images: company folder delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = public.get_user_company(auth.uid())::text
  AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
);