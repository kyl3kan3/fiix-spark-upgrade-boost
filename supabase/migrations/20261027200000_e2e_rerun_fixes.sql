-- E2E rerun: PM due datetime, meter baseline on submit, lubricant asset_id on WO usage.

-- 1) Bulk PM: store due_date as noon in company TZ (timestamptz), not date cast to UTC midnight.
CREATE OR REPLACE FUNCTION public.create_pm_work_orders_from_preview(_items jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _company_tz text;
  _item record;
  _count integer := 0;
  _due_local timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'items must be array'; END IF;
  _company_id := public.get_user_company(_uid);
  IF NOT public.has_feature(_company_id, 'bulk_pm_generation') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Bulk PM generation requires Pro or Business';
  END IF;

  SELECT COALESCE(c.timezone, 'UTC') INTO _company_tz
  FROM public.companies c
  WHERE c.id = _company_id;

  FOR _item IN
    SELECT * FROM jsonb_to_recordset(_items) AS x(
      checklist_id uuid,
      asset_id uuid,
      due_at timestamptz
    )
  LOOP
    _due_local := (
      ((_item.due_at AT TIME ZONE _company_tz)::date + time '12:00')
      AT TIME ZONE _company_tz
    );

    INSERT INTO public.work_orders (
      company_id, title, description, status, priority, asset_id, due_date, created_by
    )
    SELECT
      _company_id,
      'PM: ' || c.name,
      'Auto-generated from PM schedule',
      'pending',
      'medium',
      _item.asset_id,
      _due_local,
      _uid
    FROM public.checklists c
    WHERE c.id = _item.checklist_id AND c.company_id = _company_id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;

-- Backfill bulk PM rows that were stored at UTC midnight (shows previous calendar day in US TZ).
UPDATE public.work_orders wo
SET due_date = (
  ((wo.due_date AT TIME ZONE 'UTC')::date + time '12:00') AT TIME ZONE COALESCE(c.timezone, 'UTC')
)
FROM public.companies c
WHERE c.id = wo.company_id
  AND wo.due_date IS NOT NULL
  AND wo.title LIKE 'PM: %'
  AND wo.due_date = ((wo.due_date AT TIME ZONE 'UTC')::date AT TIME ZONE 'UTC');

-- 2) Reset meter PM baseline when a checklist with a meter rule is submitted.
CREATE OR REPLACE FUNCTION public.trg_checklist_submission_meter_baseline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.checklist_meter_rules AS r
  SET last_service_reading = m.current_reading,
      updated_at = now()
  FROM public.asset_meters AS m
  WHERE r.checklist_id = NEW.checklist_id
    AND r.meter_id = m.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS checklist_submission_meter_baseline ON public.checklist_submissions;
CREATE TRIGGER checklist_submission_meter_baseline
  AFTER INSERT ON public.checklist_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_checklist_submission_meter_baseline();

-- 3) Lubricant usage from work orders: default asset_id from the work order.
CREATE OR REPLACE FUNCTION public.record_lubricant_usage(
  _lines jsonb,
  _checklist_id uuid DEFAULT NULL,
  _checklist_submission_id uuid DEFAULT NULL,
  _work_order_id uuid DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _line record;
  _before numeric;
  _after numeric;
  _count integer := 0;
  _wo_asset_id uuid;
  _asset_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF jsonb_typeof(_lines) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'lines must be a JSON array';
  END IF;

  _company_id := public.get_user_company(_uid);
  IF _company_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'No company';
  END IF;

  IF NOT public.has_feature(_company_id, 'lubricant_tracking') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Lubricant tracking requires a Pro or Business plan';
  END IF;

  _wo_asset_id := NULL;
  IF _work_order_id IS NOT NULL THEN
    SELECT wo.asset_id INTO _wo_asset_id
    FROM public.work_orders wo
    WHERE wo.id = _work_order_id AND wo.company_id = _company_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Work order not found in company';
    END IF;
  END IF;

  IF _checklist_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.checklists c
      WHERE c.id = _checklist_id AND c.company_id = _company_id
    ) THEN
      RAISE EXCEPTION 'Checklist not found in company';
    END IF;
  END IF;

  FOR _line IN
    SELECT *
    FROM jsonb_to_recordset(_lines) AS x(
      lubricant_id uuid,
      asset_id uuid,
      quantity numeric
    )
  LOOP
    IF _line.quantity IS NULL OR _line.quantity <= 0 THEN
      CONTINUE;
    END IF;

    _asset_id := COALESCE(_line.asset_id, _wo_asset_id);

    SELECT l.quantity_on_hand
    INTO _before
    FROM public.lubricants AS l
    WHERE l.id = _line.lubricant_id
      AND l.company_id = _company_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Lubricant % not found', _line.lubricant_id;
    END IF;

    IF _checklist_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.lubricant_checklists lc
      WHERE lc.lubricant_id = _line.lubricant_id
        AND lc.checklist_id = _checklist_id
    ) THEN
      RAISE EXCEPTION 'Lubricant is not linked to this PM checklist';
    END IF;

    IF _asset_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = _asset_id AND a.company_id = _company_id
    ) THEN
      RAISE EXCEPTION 'Asset not found in company';
    END IF;

    _after := _before - _line.quantity;
    IF _after < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for lubricant % (on hand: %, requested: %)',
        _line.lubricant_id, _before, _line.quantity;
    END IF;

    UPDATE public.lubricants
    SET quantity_on_hand = _after
    WHERE id = _line.lubricant_id;

    INSERT INTO public.lubricant_usage_logs (
      company_id, lubricant_id, asset_id, checklist_id,
      checklist_submission_id, work_order_id, quantity, used_by, notes
    )
    VALUES (
      _company_id, _line.lubricant_id, _asset_id, _checklist_id,
      _checklist_submission_id, _work_order_id, _line.quantity, _uid,
      NULLIF(_notes, '')
    );

    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;

UPDATE public.lubricant_usage_logs AS l
SET asset_id = wo.asset_id
FROM public.work_orders AS wo
WHERE l.work_order_id = wo.id
  AND l.asset_id IS NULL
  AND wo.asset_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
