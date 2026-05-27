
-- 1. Remove broad super_admin policies on google_ads_connections; only service role (edge functions) should touch this table
DROP POLICY IF EXISTS "Super admins view google ads connections" ON public.google_ads_connections;
DROP POLICY IF EXISTS "Super admins insert google ads connections" ON public.google_ads_connections;
DROP POLICY IF EXISTS "Super admins update google ads connections" ON public.google_ads_connections;
DROP POLICY IF EXISTS "Super admins delete google ads connections" ON public.google_ads_connections;

-- (service_role bypasses RLS, so edge functions continue to work)

-- 2. Fix public-request-photos upload policy — recreate with correct outer name column reference
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
    WHERE c.id::text = (storage.foldername(storage.objects.name))[1]
  )
);
