-- Power / energy usage tracking: manual + CSV energy readings per company.
--
-- Captures kWh (and optional cost) readings, optionally tied to an asset or a
-- free-text meter label, so the dashboard can chart consumption and spend over
-- time. A live utility/IoT integration can later write rows with source='integration'.
-- Multi-tenant + RLS conventions match the rest of the schema: every row carries
-- company_id and access is scoped via public.get_user_company(auth.uid()).

CREATE OR REPLACE FUNCTION public.update_energy_readings_updated_at()
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

CREATE TABLE public.energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  meter_label TEXT,
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  kwh NUMERIC NOT NULL CHECK (kwh >= 0),
  cost NUMERIC CHECK (cost >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv', 'integration')),
  notes TEXT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view energy readings in their company"
  ON public.energy_readings FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can create energy readings in their company"
  ON public.energy_readings FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update energy readings in their company"
  ON public.energy_readings FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()))
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can delete energy readings in their company"
  ON public.energy_readings FOR DELETE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TRIGGER trg_energy_readings_updated_at
  BEFORE UPDATE ON public.energy_readings
  FOR EACH ROW EXECUTE FUNCTION public.update_energy_readings_updated_at();

CREATE INDEX idx_energy_readings_company ON public.energy_readings(company_id, reading_date DESC);
CREATE INDEX idx_energy_readings_asset ON public.energy_readings(asset_id);
