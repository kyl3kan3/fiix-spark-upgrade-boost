-- External event IDs belong to a meter and survive API key rotation.
CREATE TABLE public.meter_reading_events (
  meter_id uuid NOT NULL REFERENCES public.asset_meters(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  reading_id uuid NOT NULL UNIQUE REFERENCES public.meter_readings(id) ON DELETE CASCADE,
  unit text NOT NULL,
  PRIMARY KEY (meter_id, event_id)
);
ALTER TABLE public.meter_reading_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.meter_reading_events FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.ingest_meter_reading(
  _api_key_hash text, _meter_id uuid, _event_id text, _reading_value numeric,
  _unit text, _observed_at timestamptz, _notes text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _key public.api_keys%ROWTYPE;
  _meter public.asset_meters%ROWTYPE;
  _event public.meter_reading_events%ROWTYPE;
  _reading public.meter_readings%ROWTYPE;
  _replayed boolean;
BEGIN
  SELECT * INTO _key FROM public.api_keys
  WHERE key_hash = _api_key_hash AND revoked_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE SQLSTATE 'PT401' USING MESSAGE = 'Invalid or revoked API key'; END IF;
  PERFORM 1 FROM public.profiles WHERE id = _key.created_by FOR SHARE;
  IF public.get_user_company(_key.created_by) IS DISTINCT FROM _key.company_id THEN
    RAISE SQLSTATE 'PT401' USING MESSAGE = 'Invalid or revoked API key';
  END IF;
  PERFORM 1 FROM public.subscriptions
  WHERE company_id = _key.company_id AND tier = 'business' AND status IN ('active', 'trialing') FOR SHARE;
  IF NOT FOUND THEN RAISE SQLSTATE 'PT403' USING MESSAGE = 'An active Business subscription is required'; END IF;

  IF _event_id IS NULL OR length(btrim(_event_id)) NOT BETWEEN 1 AND 128
      OR _event_id <> btrim(_event_id)
      OR _unit IS NULL OR length(btrim(_unit)) NOT BETWEEN 1 AND 64
      OR _reading_value IS NULL OR _reading_value < 0 OR _reading_value >= 'Infinity'::numeric
      OR _observed_at IS NULL OR NOT isfinite(_observed_at)
      OR length(_notes) > 2000 THEN
    RAISE SQLSTATE 'PT422' USING MESSAGE = 'Invalid meter reading';
  END IF;

  SELECT m.* INTO _meter FROM public.asset_meters m
  JOIN public.assets a ON a.id = m.asset_id AND a.company_id = m.company_id
  WHERE m.id = _meter_id AND m.company_id = _key.company_id FOR UPDATE OF m;
  IF NOT FOUND THEN RAISE SQLSTATE 'PT404' USING MESSAGE = 'Meter not found'; END IF;

  -- The meter lock serializes external and manual readings. A retried event
  -- returns its original result even if newer readings have advanced the meter.
  SELECT * INTO _event FROM public.meter_reading_events WHERE meter_id = _meter_id AND event_id = _event_id;
  _replayed := FOUND;
  IF _replayed THEN
    SELECT * INTO STRICT _reading FROM public.meter_readings WHERE id = _event.reading_id;
    IF _reading.reading_value <> _reading_value OR _event.unit <> _unit
        OR _reading.recorded_at <> _observed_at OR _reading.notes IS DISTINCT FROM NULLIF(_notes, '') THEN
      RAISE SQLSTATE 'PT409' USING MESSAGE = 'Event ID already used with a different payload';
    END IF;
  ELSE
    IF _unit <> _meter.unit THEN RAISE SQLSTATE 'PT422' USING MESSAGE = 'Unit must match the meter'; END IF;
    IF _reading_value < _meter.current_reading THEN
      RAISE SQLSTATE 'PT409' USING MESSAGE = 'Reading is below the current meter value';
    END IF;
    _reading := public.record_company_meter_reading(_key.company_id, _key.created_by, _meter_id, _reading_value, _notes);
    UPDATE public.meter_readings SET recorded_at = _observed_at WHERE id = _reading.id;
    INSERT INTO public.meter_reading_events (meter_id, event_id, reading_id, unit)
    VALUES (_meter_id, _event_id, _reading.id, _unit);
  END IF;

  UPDATE public.api_keys SET last_used_at = now() WHERE id = _key.id;
  RETURN jsonb_build_object('reading_id', _reading.id, 'replayed', _replayed,
    'work_orders_created', _reading.work_orders_created, 'work_orders_deferred', _reading.work_orders_deferred);
END;
$$;
REVOKE ALL ON FUNCTION public.ingest_meter_reading(text, uuid, text, numeric, text, timestamptz, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_meter_reading(text, uuid, text, numeric, text, timestamptz, text)
  TO service_role;
NOTIFY pgrst, 'reload schema';
