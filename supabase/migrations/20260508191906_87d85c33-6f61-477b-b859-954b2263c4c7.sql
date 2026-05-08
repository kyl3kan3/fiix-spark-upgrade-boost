
-- 1. daily_logs: add company_id and tighten policies
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS company_id uuid;

UPDATE public.daily_logs d
SET company_id = p.company_id
FROM public.profiles p
WHERE d.user_id = p.id AND d.company_id IS NULL;

DROP POLICY IF EXISTS "Users can view their own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can create their own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update their own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can delete their own daily logs" ON public.daily_logs;

CREATE POLICY "Users can view their own daily logs"
ON public.daily_logs FOR SELECT
USING (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create their own daily logs"
ON public.daily_logs FOR INSERT
WITH CHECK (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update their own daily logs"
ON public.daily_logs FOR UPDATE
USING (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()))
WITH CHECK (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete their own daily logs"
ON public.daily_logs FOR DELETE
USING (auth.uid() = user_id AND company_id = public.get_user_company(auth.uid()));

-- 2. work_order_comments: enforce company scope on UPDATE
DROP POLICY IF EXISTS "Users can update their own comments" ON public.work_order_comments;
CREATE POLICY "Users can update their own comments"
ON public.work_order_comments FOR UPDATE
USING (
  auth.uid() = user_id
  AND work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.created_by IN (
      SELECT p.id FROM public.profiles p
      WHERE p.company_id = public.get_user_company(auth.uid())
    )
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.created_by IN (
      SELECT p.id FROM public.profiles p
      WHERE p.company_id = public.get_user_company(auth.uid())
    )
  )
);

-- 3. checklist_schedules: allow creators or admins to delete
CREATE POLICY "Creators or admins can delete schedules"
ON public.checklist_schedules FOR DELETE
USING (
  checklist_id IN (
    SELECT c.id FROM public.checklists c
    WHERE c.company_id = public.get_user_company(auth.uid())
      AND (c.created_by = auth.uid() OR public.has_role(auth.uid(), 'administrator'::app_role))
  )
);

-- 4. checklist_submissions: allow submitter or admin to update
CREATE POLICY "Submitter or admin can update submissions"
ON public.checklist_submissions FOR UPDATE
USING (
  submitted_by = auth.uid()
  OR (
    public.has_role(auth.uid(), 'administrator'::app_role)
    AND checklist_id IN (
      SELECT c.id FROM public.checklists c
      WHERE c.company_id = public.get_user_company(auth.uid())
    )
  )
)
WITH CHECK (
  submitted_by = auth.uid()
  OR (
    public.has_role(auth.uid(), 'administrator'::app_role)
    AND checklist_id IN (
      SELECT c.id FROM public.checklists c
      WHERE c.company_id = public.get_user_company(auth.uid())
    )
  )
);
