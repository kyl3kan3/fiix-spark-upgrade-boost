
-- Polymorphic attachments table for images on assets, locations, work_orders, daily_logs, etc.
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  url text NOT NULL,
  storage_path text NOT NULL,
  file_name text,
  content_type text,
  size_bytes integer,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attachments_entity_idx ON public.attachments (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS attachments_company_idx ON public.attachments (company_id);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Attachments: members can view" ON public.attachments;
CREATE POLICY "Attachments: members can view"
ON public.attachments
FOR SELECT
USING (company_id = public.get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Attachments: members can insert" ON public.attachments;
CREATE POLICY "Attachments: members can insert"
ON public.attachments
FOR INSERT
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND uploaded_by = auth.uid()
);

DROP POLICY IF EXISTS "Attachments: uploader or admin can delete" ON public.attachments;
CREATE POLICY "Attachments: uploader or admin can delete"
ON public.attachments
FOR DELETE
USING (
  company_id = public.get_user_company(auth.uid())
  AND (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'administrator'::app_role))
);

-- Storage policies on existing public asset-images bucket so any signed-in
-- user can upload to their company folder. Bucket is already public for reads.
DROP POLICY IF EXISTS "asset-images authenticated upload" ON storage.objects;
CREATE POLICY "asset-images authenticated upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'asset-images');

DROP POLICY IF EXISTS "asset-images authenticated delete" ON storage.objects;
CREATE POLICY "asset-images authenticated delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'asset-images');
