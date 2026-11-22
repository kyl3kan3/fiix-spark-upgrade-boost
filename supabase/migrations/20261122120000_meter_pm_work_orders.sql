-- Existing checklist rules keep their due-date behavior until a customer enables work orders.
ALTER TABLE public.checklist_meter_rules
  ALTER COLUMN last_service_reading DROP DEFAULT,
  ADD COLUMN auto_create_work_order boolean NOT NULL DEFAULT false,
  ADD COLUMN work_order_created_at timestamptz;

ALTER TABLE public.meter_readings
  ADD COLUMN work_orders_created integer NOT NULL DEFAULT 0,
  ADD COLUMN work_orders_deferred integer NOT NULL DEFAULT 0;

ALTER TABLE public.work_orders
  ADD COLUMN meter_checklist_id uuid REFERENCES public.checklists(id) ON DELETE SET NULL;

-- A manual order and a meter order claiming the last available slot share the same lock.
CREATE OR REPLACE FUNCTION public.enforce_work_order_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _company uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN RETURN NEW; END IF;
  _company := COALESCE(NEW.company_id, public.get_user_company(COALESCE(NEW.created_by, auth.uid())));
  PERFORM 1 FROM public.companies WHERE id = _company FOR NO KEY UPDATE;
  IF NOT public.company_within_limit_for(_company, 'work_order') THEN
    RAISE EXCEPTION 'plan_limit_reached: monthly work order limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.record_company_meter_reading(
  _company_id uuid, _actor_id uuid, _meter_id uuid, _reading_value numeric, _notes text
)
RETURNS public.meter_readings LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _meter public.asset_meters%ROWTYPE;
  _rule record;
  _reading public.meter_readings%ROWTYPE;
  _created integer := 0;
  _deferred integer := 0;
BEGIN
  IF _company_id IS NULL OR public.get_user_company(_actor_id) IS DISTINCT FROM _company_id THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'No active company for this user';
  END IF;
  IF _reading_value IS NULL OR _reading_value < 0 OR _reading_value >= 'Infinity'::numeric THEN
    RAISE EXCEPTION 'Enter a finite, nonnegative reading';
  END IF;

  SELECT m.* INTO _meter FROM public.asset_meters m
  JOIN public.assets a ON a.id = m.asset_id AND a.company_id = m.company_id
  WHERE m.id = _meter_id AND m.company_id = _company_id
  FOR UPDATE OF m;
  IF NOT FOUND THEN RAISE EXCEPTION 'Meter not found'; END IF;
  IF NOT public.has_feature(_meter.company_id, 'meter_based_pm') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Meter-based PM requires Pro or Business';
  END IF;
  IF _reading_value < _meter.current_reading THEN
    RAISE EXCEPTION 'Reading cannot be less than current reading (%)', _meter.current_reading;
  END IF;
  UPDATE public.asset_meters SET current_reading = _reading_value, updated_at = now() WHERE id = _meter_id;

  FOR _rule IN
    SELECT r.*, c.name FROM public.checklist_meter_rules r
    JOIN public.checklists c ON c.id = r.checklist_id AND c.company_id = r.company_id AND c.is_active
    JOIN public.checklist_assets ca ON ca.checklist_id = c.id AND ca.asset_id = _meter.asset_id
    WHERE r.meter_id = _meter_id AND r.company_id = _meter.company_id
      AND _reading_value >= r.last_service_reading + r.interval_units
    ORDER BY r.checklist_id FOR UPDATE OF r
  LOOP
    INSERT INTO public.checklist_schedules (checklist_id, next_due_at)
    VALUES (_rule.checklist_id, now())
    ON CONFLICT (checklist_id) DO UPDATE SET next_due_at = EXCLUDED.next_due_at, updated_at = now()
    WHERE public.checklist_schedules.next_due_at IS NULL OR public.checklist_schedules.next_due_at > EXCLUDED.next_due_at;

    IF _rule.auto_create_work_order AND _rule.work_order_created_at IS NULL THEN
      PERFORM 1 FROM public.companies WHERE id = _meter.company_id FOR NO KEY UPDATE;
      IF public.company_within_limit_for(_meter.company_id, 'work_order') THEN
        INSERT INTO public.work_orders (
          company_id, asset_id, meter_checklist_id, title, description, status, priority, due_date, created_by
        ) VALUES (
          _meter.company_id, _meter.asset_id, _rule.checklist_id, 'PM: ' || _rule.name,
          format('%s reached %s %s. Service was due at %s %s.', _meter.name, _reading_value, _meter.unit,
                 _rule.last_service_reading + _rule.interval_units, _meter.unit),
          'pending', 'medium', now(), _actor_id
        );
        UPDATE public.checklist_meter_rules SET work_order_created_at = now(), updated_at = now()
        WHERE checklist_id = _rule.checklist_id;
        _created := _created + 1;
      ELSE
        _deferred := _deferred + 1;
      END IF;
    END IF;
  END LOOP;

  INSERT INTO public.meter_readings (
    company_id, meter_id, reading_value, recorded_by, notes, work_orders_created, work_orders_deferred
  ) VALUES (_meter.company_id, _meter_id, _reading_value, _actor_id, NULLIF(_notes, ''), _created, _deferred)
  RETURNING * INTO _reading;
  RETURN _reading;
END;
$$;
REVOKE ALL ON FUNCTION public.record_company_meter_reading(uuid, uuid, uuid, numeric, text)
FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.record_asset_meter_reading(
  _meter_id uuid, _reading_value numeric, _notes text DEFAULT NULL
)
RETURNS public.meter_readings LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  RETURN public.record_company_meter_reading(public.get_user_company(_uid), _uid, _meter_id, _reading_value, _notes);
END;
$$;

-- Serialize service completion and readings on the same meter before updating its rule.
CREATE OR REPLACE FUNCTION public.trg_checklist_submission_meter_baseline()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _meter public.asset_meters%ROWTYPE;
BEGIN
  SELECT m.* INTO _meter FROM public.checklist_meter_rules r
  JOIN public.asset_meters m ON m.id = r.meter_id AND m.company_id = r.company_id
  JOIN public.checklists c ON c.id = r.checklist_id AND c.company_id = r.company_id
  WHERE r.checklist_id = NEW.checklist_id FOR UPDATE OF m;
  IF FOUND THEN
    UPDATE public.checklist_meter_rules
    SET last_service_reading = _meter.current_reading, work_order_created_at = NULL, updated_at = now()
    WHERE checklist_id = NEW.checklist_id AND meter_id = _meter.id;
  END IF;
  RETURN NEW;
END;
$$;

-- A different meter starts a different service cycle, even when both counters read the same.
CREATE FUNCTION public.reset_pm_rule_on_meter_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  SELECT m.current_reading INTO STRICT NEW.last_service_reading FROM public.asset_meters m
  WHERE m.id = NEW.meter_id AND m.company_id = NEW.company_id;
  NEW.work_order_created_at := NULL;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reset_pm_rule_on_meter_change BEFORE UPDATE OF meter_id ON public.checklist_meter_rules
FOR EACH ROW WHEN (NEW.meter_id IS DISTINCT FROM OLD.meter_id)
EXECUTE FUNCTION public.reset_pm_rule_on_meter_change();
-- Older clients can still insert a rule without a baseline for an in-use meter.
CREATE TRIGGER initialize_pm_service_baseline BEFORE INSERT ON public.checklist_meter_rules
FOR EACH ROW WHEN (NEW.last_service_reading IS NULL)
EXECUTE FUNCTION public.reset_pm_rule_on_meter_change();

-- Rule setup locks the same meter as readings and service submissions. A settings-only
-- edit never writes service history; changing the selected meter starts a new cycle.
CREATE FUNCTION public.save_checklist_meter_rule(
  _checklist_id uuid, _meter_id uuid, _interval_units numeric, _auto_create_work_order boolean,
  _expected_meter_id uuid DEFAULT NULL, _initial_service_reading numeric DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  _company uuid := public.get_user_company(auth.uid());
  _current numeric;
  _baseline numeric;
BEGIN
  IF NOT public.has_feature(_company, 'meter_based_pm') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Meter-based PM requires Pro or Business';
  END IF;
  IF _interval_units IS NULL OR _interval_units <= 0 OR _interval_units >= 'Infinity'::numeric THEN
    RAISE EXCEPTION 'Enter a positive, finite service interval';
  END IF;
  SELECT m.current_reading INTO _current FROM public.asset_meters m
  JOIN public.assets a ON a.id = m.asset_id AND a.company_id = m.company_id
  JOIN public.checklist_assets ca ON ca.asset_id = a.id AND ca.checklist_id = _checklist_id
  JOIN public.checklists c ON c.id = ca.checklist_id AND c.company_id = m.company_id
  WHERE m.id = _meter_id AND m.company_id = _company FOR UPDATE OF m;
  IF NOT FOUND THEN RAISE EXCEPTION 'Select a meter on equipment linked to this checklist'; END IF;

  IF _expected_meter_id IS DISTINCT FROM _meter_id THEN
    _baseline := COALESCE(_initial_service_reading, _current);
    IF _baseline < 0 OR _baseline > _current OR _baseline >= 'Infinity'::numeric THEN
      RAISE EXCEPTION 'Last service reading must be between zero and the current meter reading';
    END IF;
  END IF;
  IF _expected_meter_id IS NULL THEN
    INSERT INTO public.checklist_meter_rules (
      checklist_id, company_id, meter_id, interval_units, auto_create_work_order, last_service_reading
    ) VALUES (_checklist_id, _company, _meter_id, _interval_units, _auto_create_work_order, _baseline)
    ON CONFLICT (checklist_id) DO NOTHING;
  ELSE
    UPDATE public.checklist_meter_rules SET meter_id = _meter_id, interval_units = _interval_units,
      auto_create_work_order = _auto_create_work_order, updated_at = now()
    WHERE checklist_id = _checklist_id AND company_id = _company AND meter_id = _expected_meter_id;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'The selected meter changed. Reload the rule and try again'; END IF;
  -- The meter-change trigger defaults to the new counter's current reading. Apply a
  -- supplied service history under the same row lock when the operator chose an earlier value.
  IF _expected_meter_id IS NOT NULL AND _baseline IS NOT NULL AND _baseline <> _current THEN
    UPDATE public.checklist_meter_rules SET last_service_reading = _baseline WHERE checklist_id = _checklist_id;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.save_checklist_meter_rule(uuid, uuid, numeric, boolean, uuid, numeric)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_checklist_meter_rule(uuid, uuid, numeric, boolean, uuid, numeric)
TO authenticated;

NOTIFY pgrst, 'reload schema';
