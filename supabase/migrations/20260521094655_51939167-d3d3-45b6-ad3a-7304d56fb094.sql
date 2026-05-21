
-- 1) SMS opt-ins: restrict reads to service_role only
DROP POLICY IF EXISTS "Administrators can view opt-ins" ON public.sms_optins;
CREATE POLICY "Service role can view opt-ins"
ON public.sms_optins
FOR SELECT
TO service_role
USING (true);

-- 2) Storage: tighten delete on asset-images so admins can only delete files
-- belonging to users in their own company.
DROP POLICY IF EXISTS "asset-images: uploader or admin can delete" ON storage.objects;
CREATE POLICY "asset-images: uploader or same-company admin can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'asset-images'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR (
      public.has_role(auth.uid(), 'administrator'::public.app_role)
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id::text = (storage.foldername(objects.name))[1]
          AND p.company_id = public.get_user_company(auth.uid())
      )
    )
  )
);

-- 3) Work orders: add direct company_id column and enforce it in RLS
ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- Backfill from creator's profile
UPDATE public.work_orders wo
SET company_id = p.company_id
FROM public.profiles p
WHERE wo.created_by = p.id
  AND wo.company_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON public.work_orders(company_id);

-- Auto-populate company_id on insert when not provided
CREATE OR REPLACE FUNCTION public.set_work_order_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    SELECT company_id INTO NEW.company_id
    FROM public.profiles
    WHERE id = COALESCE(NEW.created_by, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_work_order_company_id_trigger ON public.work_orders;
CREATE TRIGGER set_work_order_company_id_trigger
BEFORE INSERT ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_work_order_company_id();

-- Rewrite RLS policies to use company_id directly
DROP POLICY IF EXISTS "Users can view work orders in their company" ON public.work_orders;
CREATE POLICY "Users can view work orders in their company"
ON public.work_orders
FOR SELECT
USING (
  company_id IS NOT NULL
  AND company_id = public.get_user_company(auth.uid())
);

DROP POLICY IF EXISTS "Users can create work orders" ON public.work_orders;
CREATE POLICY "Users can create work orders"
ON public.work_orders
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND company_id IS NOT NULL
  AND company_id = public.get_user_company(auth.uid())
);

DROP POLICY IF EXISTS "Users can update work orders they own or are assigned to" ON public.work_orders;
CREATE POLICY "Users can update work orders they own or are assigned to"
ON public.work_orders
FOR UPDATE
USING (
  company_id = public.get_user_company(auth.uid())
  AND (auth.uid() = created_by OR auth.uid() = assigned_to)
)
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND (auth.uid() = created_by OR auth.uid() = assigned_to)
);

DROP POLICY IF EXISTS "Creators or admins can delete work orders" ON public.work_orders;
CREATE POLICY "Creators or admins can delete work orders"
ON public.work_orders
FOR DELETE
USING (
  company_id = public.get_user_company(auth.uid())
  AND (
    auth.uid() = created_by
    OR public.has_role(auth.uid(), 'administrator'::public.app_role)
  )
);
