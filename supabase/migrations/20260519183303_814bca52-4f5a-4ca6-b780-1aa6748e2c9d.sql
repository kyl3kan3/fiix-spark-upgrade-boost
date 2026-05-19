
DROP POLICY IF EXISTS "Submitter or admin can delete submissions" ON public.checklist_submissions;
DROP POLICY IF EXISTS "Submitter or admin can update submissions" ON public.checklist_submissions;

CREATE POLICY "Submitter or admin can delete submissions"
ON public.checklist_submissions
FOR DELETE
USING (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.company_id = public.get_user_company(auth.uid())
  )
  AND (
    submitted_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
  )
);

CREATE POLICY "Submitter or admin can update submissions"
ON public.checklist_submissions
FOR UPDATE
USING (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.company_id = public.get_user_company(auth.uid())
  )
  AND (
    submitted_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
  )
)
WITH CHECK (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.company_id = public.get_user_company(auth.uid())
  )
  AND (
    submitted_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrator'::app_role)
  )
);
