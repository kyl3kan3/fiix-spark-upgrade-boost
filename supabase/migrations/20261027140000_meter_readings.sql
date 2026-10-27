-- Asset meters, readings, and meter-interval PM triggers (alongside time-based schedules).

CREATE TABLE public.asset_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'hrs',
  current_reading NUMERIC NOT NULL DEFAULT 0 CHECK (current_reading >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, asset_id, name)
);

CREATE INDEX idx_asset_meters_asset ON public.asset_meters(asset_id);
ALTER TABLE public.asset_meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meters in their company"
  ON public.asset_meters FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can manage meters"
  ON public.asset_meters FOR ALL
  USING (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'meter_based_pm'))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'meter_based_pm'));

CREATE TABLE public.meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  meter_id UUID NOT NULL REFERENCES public.asset_meters(id) ON DELETE CASCADE,
  reading_value NUMERIC NOT NULL CHECK (reading_value >= 0),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by UUID DEFAULT auth.uid(),
  notes TEXT
);

CREATE INDEX idx_meter_readings_meter ON public.meter_readings(meter_id, recorded_at DESC);
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meter readings in their company"
  ON public.meter_readings FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can insert meter readings"
  ON public.meter_readings FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'meter_based_pm'));

CREATE TABLE public.checklist_meter_rules (
  checklist_id UUID PRIMARY KEY REFERENCES public.checklists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  meter_id UUID NOT NULL REFERENCES public.asset_meters(id) ON DELETE CASCADE,
  interval_units NUMERIC NOT NULL CHECK (interval_units > 0),
  last_service_reading NUMERIC NOT NULL DEFAULT 0 CHECK (last_service_reading >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_meter_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist meter rules in their company"
  ON public.checklist_meter_rules FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can manage checklist meter rules"
  ON public.checklist_meter_rules FOR ALL
  USING (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'meter_based_pm'))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'meter_based_pm'));

CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier public.subscription_tier;
  _status public.subscription_status;
BEGIN
  IF _company_id IS NULL THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company_id;
  IF _tier IS NULL THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  RETURN CASE _feature
    WHEN 'analytics'           THEN _tier IN ('pro','business')
    WHEN 'automations'         THEN _tier IN ('pro','business')
    WHEN 'api'                 THEN _tier = 'business'
    WHEN 'sso'                 THEN _tier = 'business'
    WHEN 'lubricant_tracking'  THEN _tier IN ('pro','business')
    WHEN 'parts_inventory'     THEN _tier IN ('pro','business')
    WHEN 'meter_based_pm'      THEN _tier IN ('pro','business')
    ELSE false
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_asset_meter_reading(
  _meter_id uuid,
  _reading_value numeric,
  _notes text DEFAULT NULL
)
RETURNS public.meter_readings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _prev numeric;
  _row public.meter_readings%ROWTYPE;
  _rule record;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF _reading_value IS NULL OR _reading_value < 0 THEN RAISE EXCEPTION 'reading_value must be >= 0'; END IF;

  SELECT m.company_id, m.current_reading INTO _company_id, _prev
  FROM public.asset_meters m
  WHERE m.id = _meter_id AND m.company_id = public.get_user_company(_uid)
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Meter not found'; END IF;
  IF NOT public.has_feature(_company_id, 'meter_based_pm') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Meter-based PM requires Pro or Business';
  END IF;
  IF _reading_value < _prev THEN
    RAISE EXCEPTION 'Reading cannot be less than current reading (%)', _prev;
  END IF;

  UPDATE public.asset_meters SET current_reading = _reading_value, updated_at = now() WHERE id = _meter_id;

  INSERT INTO public.meter_readings (company_id, meter_id, reading_value, recorded_by, notes)
  VALUES (_company_id, _meter_id, _reading_value, _uid, NULLIF(_notes, ''))
  RETURNING * INTO _row;

  FOR _rule IN
    SELECT r.* FROM public.checklist_meter_rules r WHERE r.meter_id = _meter_id
  LOOP
    IF (_reading_value - _rule.last_service_reading) >= _rule.interval_units THEN
      INSERT INTO public.checklist_schedules (checklist_id, next_due_at, last_submitted_at)
      VALUES (_rule.checklist_id, now(), NULL)
      ON CONFLICT (checklist_id) DO UPDATE SET next_due_at = now(), updated_at = now();
    END IF;
  END LOOP;

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.record_asset_meter_reading(uuid, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_asset_meter_reading(uuid, numeric, text) TO authenticated;
