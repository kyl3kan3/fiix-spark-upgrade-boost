
-- 1. checklists: replace profiles subselect with get_user_company
DROP POLICY IF EXISTS "Users can view checklists from their company" ON public.checklists;
CREATE POLICY "Users can view checklists from their company"
ON public.checklists FOR SELECT
USING (company_id = public.get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Users can create checklists for their company" ON public.checklists;
CREATE POLICY "Users can create checklists for their company"
ON public.checklists FOR INSERT
WITH CHECK (company_id = public.get_user_company(auth.uid()) AND created_by = auth.uid());

-- checklist_submissions
DROP POLICY IF EXISTS "Users can view submissions from their company" ON public.checklist_submissions;
CREATE POLICY "Users can view submissions from their company"
ON public.checklist_submissions FOR SELECT
USING (checklist_id IN (
  SELECT c.id FROM public.checklists c
  WHERE c.company_id = public.get_user_company(auth.uid())
));

-- checklist_submission_items
DROP POLICY IF EXISTS "Users can view submission items from their company" ON public.checklist_submission_items;
CREATE POLICY "Users can view submission items from their company"
ON public.checklist_submission_items FOR SELECT
USING (submission_id IN (
  SELECT cs.id FROM public.checklist_submissions cs
  JOIN public.checklists c ON c.id = cs.checklist_id
  WHERE c.company_id = public.get_user_company(auth.uid())
));

-- 2. organizations: replace profiles subselect
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
CREATE POLICY "Users can view their organization"
ON public.organizations FOR SELECT TO authenticated
USING (id = public.get_user_company(auth.uid()));

DROP POLICY IF EXISTS "Users can update their organization" ON public.organizations;
CREATE POLICY "Users can update their organization"
ON public.organizations FOR UPDATE TO authenticated
USING (id = public.get_user_company(auth.uid()))
WITH CHECK (id = public.get_user_company(auth.uid()));

-- 3. subscriptions: remove user-facing INSERT/UPDATE policies, keep service_role only
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.subscriptions'::regclass
      AND polcmd IN ('a','w')  -- INSERT, UPDATE
  LOOP
    -- keep service_role policies (they typically reference auth.role() = 'service_role')
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscriptions', r.polname);
  END LOOP;
END $$;

-- Recreate service-role-only write policies
CREATE POLICY "Service role can insert subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
