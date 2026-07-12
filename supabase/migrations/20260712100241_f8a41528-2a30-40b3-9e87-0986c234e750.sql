
-- 1. Remove parallel uid-keyed asset-images policies (consolidate on company folder)
DROP POLICY IF EXISTS "asset-images: uploader can insert" ON storage.objects;
DROP POLICY IF EXISTS "asset-images: uploader can update" ON storage.objects;

-- Simplify read + delete to company-folder only
DROP POLICY IF EXISTS "asset-images: company members can read" ON storage.objects;
CREATE POLICY "asset-images: company members can read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'asset-images'
    AND (storage.foldername(name))[1] = (public.get_user_company(auth.uid()))::text
  );

DROP POLICY IF EXISTS "asset-images: uploader or same-company admin can delete" ON storage.objects;
-- company-folder delete policy already covers admins + owners via the existing
-- "asset-images: company folder delete" policy; nothing more needed here.

-- 2. Companies UPDATE: re-check admin role in WITH CHECK
DROP POLICY IF EXISTS "Companies: admins can update" ON public.companies;
CREATE POLICY "Companies: admins can update"
  ON public.companies FOR UPDATE
  USING (
    id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
  WITH CHECK (
    id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'administrator'::public.app_role)
  );

-- 3. Vendors UPDATE: re-check admin/manager role in WITH CHECK
DROP POLICY IF EXISTS "Vendors: admins/managers can update" ON public.vendors;
CREATE POLICY "Vendors: admins/managers can update"
  ON public.vendors FOR UPDATE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND (
      public.has_role(auth.uid(), 'administrator'::public.app_role)
      OR public.has_role(auth.uid(), 'manager'::public.app_role)
    )
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND (
      public.has_role(auth.uid(), 'administrator'::public.app_role)
      OR public.has_role(auth.uid(), 'manager'::public.app_role)
    )
  );
