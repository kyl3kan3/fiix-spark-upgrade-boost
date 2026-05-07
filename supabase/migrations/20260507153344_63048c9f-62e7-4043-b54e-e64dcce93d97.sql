ALTER TABLE public.attachments ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS attachments_entity_idx ON public.attachments (entity_type, entity_id, sort_order);

-- Allow uploaders or admins to update attachments (needed for reordering)
DROP POLICY IF EXISTS "Attachments: uploader or admin can update" ON public.attachments;
CREATE POLICY "Attachments: uploader or admin can update"
ON public.attachments
FOR UPDATE
USING (
  (company_id = get_user_company(auth.uid()))
  AND ((uploaded_by = auth.uid()) OR has_role(auth.uid(), 'administrator'::app_role))
)
WITH CHECK (company_id = get_user_company(auth.uid()));