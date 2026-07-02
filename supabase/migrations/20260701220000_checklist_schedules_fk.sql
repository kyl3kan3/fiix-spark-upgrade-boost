-- Fix: checklist_schedules.checklist_id was created (20260430194249) without a
-- REFERENCES clause, so no foreign key to checklists ever existed. PostgREST
-- can only resolve embeds like `schedule:checklist_schedules(*)` through a
-- declared FK, so every such query in checklistService fails with PGRST200
-- ("no relationship found in the schema cache") and the Inspections page 400s.
--
-- This adds the missing FK, matching the ON DELETE CASCADE convention the
-- sibling checklist tables already use. Written to be idempotent (guarded by
-- pg_constraint lookup) so it is safe if the constraint was meanwhile added
-- another way.

-- A schedule row whose checklist no longer exists is meaningless (and would
-- block the constraint), so clear any orphans first.
DELETE FROM public.checklist_schedules cs
WHERE NOT EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = cs.checklist_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'checklist_schedules_checklist_id_fkey'
      AND conrelid = 'public.checklist_schedules'::regclass
  ) THEN
    ALTER TABLE public.checklist_schedules
      ADD CONSTRAINT checklist_schedules_checklist_id_fkey
      FOREIGN KEY (checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- Tell PostgREST to reload its schema cache immediately so the embeds start
-- resolving without waiting for the next automatic reload.
NOTIFY pgrst, 'reload schema';
