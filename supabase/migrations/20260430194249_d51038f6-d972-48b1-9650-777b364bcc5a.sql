
-- Link checklists to assets (many-to-many)
CREATE TABLE public.checklist_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (checklist_id, asset_id)
);

CREATE INDEX idx_checklist_assets_checklist ON public.checklist_assets(checklist_id);
CREATE INDEX idx_checklist_assets_asset ON public.checklist_assets(asset_id);

ALTER TABLE public.checklist_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist asset links in their company"
ON public.checklist_assets
FOR SELECT
USING (
  checklist_id IN (
    SELECT id FROM public.checklists
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

CREATE POLICY "Checklist creators can add asset links"
ON public.checklist_assets
FOR INSERT
WITH CHECK (
  checklist_id IN (
    SELECT id FROM public.checklists WHERE created_by = auth.uid()
  )
  AND asset_id IN (
    SELECT id FROM public.assets
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

CREATE POLICY "Checklist creators can remove asset links"
ON public.checklist_assets
FOR DELETE
USING (
  checklist_id IN (
    SELECT id FROM public.checklists WHERE created_by = auth.uid()
  )
);

-- Per-checklist schedule (next due timestamp)
CREATE TABLE public.checklist_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL UNIQUE,
  next_due_at TIMESTAMP WITH TIME ZONE,
  last_submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_schedules_next_due ON public.checklist_schedules(next_due_at);

ALTER TABLE public.checklist_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules for their company's checklists"
ON public.checklist_schedules
FOR SELECT
USING (
  checklist_id IN (
    SELECT id FROM public.checklists
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

CREATE POLICY "Users can insert schedules for their company's checklists"
ON public.checklist_schedules
FOR INSERT
WITH CHECK (
  checklist_id IN (
    SELECT id FROM public.checklists
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

CREATE POLICY "Users can update schedules for their company's checklists"
ON public.checklist_schedules
FOR UPDATE
USING (
  checklist_id IN (
    SELECT id FROM public.checklists
    WHERE company_id = public.get_user_company(auth.uid())
  )
);

CREATE TRIGGER update_checklist_schedules_updated_at
BEFORE UPDATE ON public.checklist_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_user_settings_updated_at();

-- Tie each submission item to a specific asset (optional)
ALTER TABLE public.checklist_submission_items
ADD COLUMN asset_id UUID;

CREATE INDEX idx_submission_items_asset ON public.checklist_submission_items(asset_id);
