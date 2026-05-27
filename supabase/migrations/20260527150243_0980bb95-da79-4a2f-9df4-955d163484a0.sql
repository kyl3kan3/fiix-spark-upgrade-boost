DROP POLICY IF EXISTS "Users can view checklist items from their company" ON public.checklist_items;

CREATE POLICY "Users can view checklist items from their company"
ON public.checklist_items
FOR SELECT
USING (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.company_id = public.get_user_company(auth.uid())
  )
);