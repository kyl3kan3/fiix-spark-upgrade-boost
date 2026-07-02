-- Same defect class as 20260701220000: the 20260430194249 migration created
-- checklist_assets with bare UUID columns (checklist_id, asset_id) and no
-- REFERENCES clauses, so neither foreign key ever existed. The
-- `asset_links:checklist_assets(...)` embeds in checklistService (lines
-- 29/46/315/335) need a declared FK to resolve, so those queries fail with
-- PGRST200 the same way the schedules embed did. Idempotent, like its sibling.

DELETE FROM public.checklist_assets ca
WHERE NOT EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = ca.checklist_id)
   OR NOT EXISTS (SELECT 1 FROM public.assets a WHERE a.id = ca.asset_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'checklist_assets_checklist_id_fkey'
      AND conrelid = 'public.checklist_assets'::regclass
  ) THEN
    ALTER TABLE public.checklist_assets
      ADD CONSTRAINT checklist_assets_checklist_id_fkey
      FOREIGN KEY (checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'checklist_assets_asset_id_fkey'
      AND conrelid = 'public.checklist_assets'::regclass
  ) THEN
    ALTER TABLE public.checklist_assets
      ADD CONSTRAINT checklist_assets_asset_id_fkey
      FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
