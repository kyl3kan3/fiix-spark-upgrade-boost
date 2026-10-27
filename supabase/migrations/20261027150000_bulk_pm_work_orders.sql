-- Preview and bulk-create preventive work orders from PM schedules.

CREATE OR REPLACE FUNCTION public.preview_pm_work_orders(_days_ahead integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _out jsonb := '[]'::jsonb;
  _rec record;
  _due timestamptz;
  _end timestamptz;
  _step interval;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  _company_id := public.get_user_company(_uid);
  IF NOT public.has_feature(_company_id, 'bulk_pm_generation') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Bulk PM generation requires Pro or Business';
  END IF;
  IF _days_ahead IS NULL OR _days_ahead < 1 OR _days_ahead > 365 THEN
    RAISE EXCEPTION 'days_ahead must be between 1 and 365';
  END IF;
  _end := now() + make_interval(days => _days_ahead);

  FOR _rec IN
    SELECT c.id AS checklist_id, c.name, c.frequency, s.next_due_at, ca.asset_id
    FROM public.checklists c
    JOIN public.checklist_schedules s ON s.checklist_id = c.id
    LEFT JOIN LATERAL (
      SELECT asset_id FROM public.checklist_assets WHERE checklist_id = c.id LIMIT 1
    ) ca ON true
    WHERE c.company_id = _company_id AND c.is_active = true AND c.frequency <> 'one-time'
  LOOP
    _due := COALESCE(_rec.next_due_at, now());
    _step := CASE _rec.frequency
      WHEN 'daily' THEN interval '1 day'
      WHEN 'twice-daily' THEN interval '12 hours'
      WHEN 'weekly' THEN interval '7 days'
      WHEN 'biweekly' THEN interval '14 days'
      WHEN 'monthly' THEN interval '1 month'
      WHEN 'quarterly' THEN interval '3 months'
      WHEN 'annually' THEN interval '1 year'
      ELSE interval '7 days'
    END;
    WHILE _due <= _end LOOP
      _out := _out || jsonb_build_array(jsonb_build_object(
        'checklist_id', _rec.checklist_id,
        'checklist_name', _rec.name,
        'asset_id', _rec.asset_id,
        'due_at', _due
      ));
      _due := _due + _step;
    END LOOP;
  END LOOP;
  RETURN _out;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_pm_work_orders_from_preview(_items jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _item record;
  _count integer := 0;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'items must be array'; END IF;
  _company_id := public.get_user_company(_uid);
  IF NOT public.has_feature(_company_id, 'bulk_pm_generation') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Bulk PM generation requires Pro or Business';
  END IF;

  FOR _item IN
    SELECT * FROM jsonb_to_recordset(_items) AS x(
      checklist_id uuid,
      asset_id uuid,
      due_at timestamptz
    )
  LOOP
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
      (_item.due_at AT TIME ZONE 'UTC')::date,
      _uid
    FROM public.checklists c
    WHERE c.id = _item.checklist_id AND c.company_id = _company_id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;

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
    WHEN 'bulk_pm_generation'  THEN _tier IN ('pro','business')
    ELSE false
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.preview_pm_work_orders(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_pm_work_orders(integer) TO authenticated;
REVOKE ALL ON FUNCTION public.create_pm_work_orders_from_preview(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_pm_work_orders_from_preview(jsonb) TO authenticated;
