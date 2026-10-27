-- Store PM due dates in the company's timezone (avoids UTC date shift for US tenants).

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
      (_item.due_at AT TIME ZONE _company_tz)::date,
      _uid
    FROM public.checklists c
    WHERE c.id = _item.checklist_id AND c.company_id = _company_id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;
