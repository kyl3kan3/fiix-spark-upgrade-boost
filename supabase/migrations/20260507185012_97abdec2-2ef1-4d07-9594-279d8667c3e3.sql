
ALTER TABLE public.attachments
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS description text;

CREATE TABLE IF NOT EXISTS public.attachment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  attachment_id uuid,
  action text NOT NULL CHECK (action IN ('uploaded','deleted','reordered','updated')),
  actor_id uuid NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachment_audit_company ON public.attachment_audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachment_audit_entity  ON public.attachment_audit_log(entity_type, entity_id, created_at DESC);

ALTER TABLE public.attachment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit: members can view their company entries"
ON public.attachment_audit_log
FOR SELECT
USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Audit: members can insert their own entries"
ON public.attachment_audit_log
FOR INSERT
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND actor_id = auth.uid()
);
