
-- 1. Notifications overshare fix
DROP POLICY IF EXISTS "Members view notifications by work order in company" ON public.notifications;

-- 2. Profiles role escalation: hard-block role/company_id changes via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_role_company_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.role() <> 'service_role' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Changing profile role is not allowed';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Changing profile company is not allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_company_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_company_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_company_change();

-- 3. Storage policy fix for public-request-photos
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
