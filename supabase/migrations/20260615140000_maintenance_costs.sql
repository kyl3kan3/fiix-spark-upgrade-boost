-- Cost & savings tracking: manual maintenance cost entries per company.
--
-- Captures money spent on maintenance (labor, parts, contractor, downtime, other),
-- optionally linked to an asset and/or work order, and tagged preventive vs reactive
-- so the dashboard can tell the cost-savings story. Multi-tenant + RLS conventions
-- match the rest of the schema: every row carries company_id and access is scoped
-- via public.get_user_company(auth.uid()).

CREATE OR REPLACE FUNCTION public.update_maintenance_costs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.maintenance_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
    'labor', 'parts', 'contractor', 'downtime', 'other'
  )),
  maintenance_type TEXT NOT NULL DEFAULT 'reactive' CHECK (maintenance_type IN (
    'preventive', 'reactive', 'other'
  )),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  incurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view costs in their company"
  ON public.maintenance_costs FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create costs in their company"
  ON public.maintenance_costs FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update costs in their company"
  ON public.maintenance_costs FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete costs in their company"
  ON public.maintenance_costs FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_maintenance_costs_updated_at
  BEFORE UPDATE ON public.maintenance_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_costs_updated_at();

CREATE INDEX idx_maintenance_costs_company ON public.maintenance_costs(company_id);
CREATE INDEX idx_maintenance_costs_asset ON public.maintenance_costs(asset_id);
CREATE INDEX idx_maintenance_costs_incurred ON public.maintenance_costs(company_id, incurred_at DESC);
