-- Locations: coords + per-location toggle
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS weather_alerts_enabled boolean NOT NULL DEFAULT false;

-- Companies: thresholds + toggle
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS temp_min_c numeric,
  ADD COLUMN IF NOT EXISTS temp_max_c numeric,
  ADD COLUMN IF NOT EXISTS temp_unit text NOT NULL DEFAULT 'F',
  ADD COLUMN IF NOT EXISTS weather_alerts_enabled boolean NOT NULL DEFAULT false;

-- Readings history
CREATE TABLE IF NOT EXISTS public.weather_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  location_id uuid NOT NULL,
  temperature_c numeric NOT NULL,
  raw jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_weather_readings_location_time
  ON public.weather_readings (location_id, fetched_at DESC);

ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view weather readings in their company"
  ON public.weather_readings
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

-- Alert state (one row per location)
CREATE TABLE IF NOT EXISTS public.weather_alert_state (
  location_id uuid PRIMARY KEY,
  company_id uuid NOT NULL,
  last_kind text NOT NULL DEFAULT 'ok', -- 'ok' | 'high' | 'low'
  last_temperature_c numeric,
  last_alert_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.weather_alert_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view alert state in their company"
  ON public.weather_alert_state
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));