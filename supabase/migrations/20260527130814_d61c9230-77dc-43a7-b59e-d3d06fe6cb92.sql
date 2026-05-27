-- Fix public_requests INSERT policy to validate company exists
DROP POLICY IF EXISTS "Anyone can submit a public request" ON public.public_requests;

CREATE POLICY "Anyone can submit a public request"
ON public.public_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  company_id IS NOT NULL
  AND status = 'new'
  AND type = ANY (ARRAY['standard'::text, 'urgent'::text])
  AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id)
);

-- Fix storage policy self-reference bug
DROP POLICY IF EXISTS "Public request photos: constrained anon upload" ON storage.objects;

CREATE POLICY "Public request photos: constrained anon upload"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'public-request-photos'
  AND COALESCE(metadata ->> 'mimetype', '') LIKE 'image/%'
  AND COALESCE((metadata ->> 'size')::bigint, 0) <= 10485760
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id::text = (storage.foldername(name))[1]
  )
);