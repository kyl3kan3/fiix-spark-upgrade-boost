ALTER TABLE public.energy_readings ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.floor_plans ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.maintenance_costs ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.onboarding_documents ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "Users can create energy readings in their company" ON public.energy_readings;
CREATE POLICY "Users can create energy readings in their company"
ON public.energy_readings FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company(auth.uid()) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create floor plans in their company" ON public.floor_plans;
CREATE POLICY "Users can create floor plans in their company"
ON public.floor_plans FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company(auth.uid()) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create costs in their company" ON public.maintenance_costs;
CREATE POLICY "Users can create costs in their company"
ON public.maintenance_costs FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company(auth.uid()) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create onboarding documents in their company" ON public.onboarding_documents;
CREATE POLICY "Users can create onboarding documents in their company"
ON public.onboarding_documents FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company(auth.uid()) AND uploaded_by = auth.uid());