ALTER TABLE public.checklist_assets
ADD COLUMN IF NOT EXISTS start_offset_minutes INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.checklist_assets.start_offset_minutes IS
'Minutes to offset this asset''s daily prompt from the checklist''s base due time, to stagger inspections across assets.';