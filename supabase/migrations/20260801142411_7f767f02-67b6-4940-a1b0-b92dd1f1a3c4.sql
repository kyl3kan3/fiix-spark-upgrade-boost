-- 1. Allow submitters/admins to correct checklist submission answers
DROP POLICY IF EXISTS "Submitter or admin can update submission items" ON public.checklist_submission_items;
CREATE POLICY "Submitter or admin can update submission items"
ON public.checklist_submission_items
FOR UPDATE
TO authenticated
USING (
  submission_id IN (
    SELECT cs.id
    FROM public.checklist_submissions cs
    JOIN public.checklists c ON c.id = cs.checklist_id
    WHERE c.company_id = public.get_user_company(auth.uid())
      AND (cs.submitted_by = auth.uid() OR public.has_role(auth.uid(), 'administrator'::app_role))
  )
)
WITH CHECK (
  submission_id IN (
    SELECT cs.id
    FROM public.checklist_submissions cs
    JOIN public.checklists c ON c.id = cs.checklist_id
    WHERE c.company_id = public.get_user_company(auth.uid())
      AND (cs.submitted_by = auth.uid() OR public.has_role(auth.uid(), 'administrator'::app_role))
  )
);

-- 2. Prevent spoofing company ownership on creation
DROP POLICY IF EXISTS "Companies: authenticated can create" ON public.companies;
CREATE POLICY "Companies: authenticated can create"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());