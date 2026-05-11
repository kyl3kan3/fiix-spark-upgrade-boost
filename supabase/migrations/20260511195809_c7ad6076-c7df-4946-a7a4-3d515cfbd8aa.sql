
-- 1. Restrictive policy blocking direct authenticated INSERTs into attachment_audit_log
CREATE POLICY "Audit: block direct user inserts"
ON public.attachment_audit_log
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 2. Tighten asset-images SELECT to same-company users
DROP POLICY IF EXISTS "asset-images authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "asset-images members read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read asset-images" ON storage.objects;

CREATE POLICY "asset-images: same-company read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (
    -- own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- uploader is in same company as the requester
    EXISTS (
      SELECT 1
      FROM public.profiles uploader, public.profiles me
      WHERE me.id = auth.uid()
        AND uploader.id::text = (storage.foldername(name))[1]
        AND uploader.company_id = me.company_id
        AND me.company_id IS NOT NULL
    )
  )
);

-- Also restrict INSERT/UPDATE/DELETE to the user's own folder
DROP POLICY IF EXISTS "asset-images: own folder write" ON storage.objects;
CREATE POLICY "asset-images: own folder write"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
DROP POLICY IF EXISTS "asset-images: own folder update" ON storage.objects;
CREATE POLICY "asset-images: own folder update"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
DROP POLICY IF EXISTS "asset-images: own folder delete" ON storage.objects;
CREATE POLICY "asset-images: own folder delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'asset-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Profiles INSERT policy: require role to be NULL or 'technician' (a valid app_role label)
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
CREATE POLICY "Profiles: insert own"
ON public.profiles
FOR INSERT
WITH CHECK (
  (auth.role() = 'service_role')
  OR (
    id = auth.uid()
    AND (
      company_id IS NULL
      OR company_id IN (SELECT companies.id FROM public.companies WHERE companies.created_by = auth.uid())
    )
    AND (role IS NULL OR role = 'technician')
  )
);
