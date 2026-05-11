
-- Tighten profiles INSERT to prevent injecting arbitrary company_id
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
CREATE POLICY "Profiles: insert own"
ON public.profiles
FOR INSERT
WITH CHECK (
  (auth.role() = 'service_role'::text)
  OR (
    id = auth.uid()
    AND (
      company_id IS NULL
      OR company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
    )
    AND (role IS NULL OR role = 'user'::text)
  )
);

-- Tighten checklist_submissions INSERT to require company scope
DROP POLICY IF EXISTS "Users can create submissions" ON public.checklist_submissions;
CREATE POLICY "Users can create submissions"
ON public.checklist_submissions
FOR INSERT
WITH CHECK (
  submitted_by = auth.uid()
  AND checklist_id IN (
    SELECT id FROM public.checklists WHERE company_id = public.get_user_company(auth.uid())
  )
);

-- Tighten checklist_submission_items INSERT to require company scope on the parent checklist
DROP POLICY IF EXISTS "Users can create submission items for their submissions" ON public.checklist_submission_items;
CREATE POLICY "Users can create submission items for their submissions"
ON public.checklist_submission_items
FOR INSERT
WITH CHECK (
  submission_id IN (
    SELECT cs.id
    FROM public.checklist_submissions cs
    JOIN public.checklists c ON c.id = cs.checklist_id
    WHERE cs.submitted_by = auth.uid()
      AND c.company_id = public.get_user_company(auth.uid())
  )
);
