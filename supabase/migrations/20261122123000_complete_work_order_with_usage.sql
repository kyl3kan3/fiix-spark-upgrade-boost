-- A work-order closeout and its inventory consumption commit together.
CREATE FUNCTION public.complete_work_order_with_usage(
  _work_order_id uuid,
  _parts jsonb DEFAULT '[]'::jsonb,
  _lubricants jsonb DEFAULT '[]'::jsonb,
  _failure_code_id uuid DEFAULT NULL,
  _downtime_code_id uuid DEFAULT NULL,
  _downtime_minutes numeric DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  _company_id uuid;
  _asset_id uuid;
BEGIN
  -- RLS applies to this update. The status predicate is checked again after
  -- a concurrent writer releases the row, before any stock can be consumed.
  UPDATE public.work_orders
     SET status = 'completed',
         failure_code_id = coalesce(_failure_code_id, failure_code_id),
         downtime_code_id = coalesce(_downtime_code_id, downtime_code_id),
         downtime_minutes = coalesce(_downtime_minutes, downtime_minutes)
   WHERE id = _work_order_id AND status = 'in_progress'
   RETURNING company_id, asset_id INTO _company_id, _asset_id;
  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.work_orders WHERE id = _work_order_id AND status = 'completed') THEN
      RETURN false;
    END IF;
    RAISE EXCEPTION 'Could not complete this work order. Check its current status and your access.';
  END IF;

  IF _failure_code_id IS NOT NULL OR _downtime_code_id IS NOT NULL OR _downtime_minutes IS NOT NULL THEN
    IF NOT public.has_feature(_company_id, 'failure_downtime_codes') THEN
      RAISE EXCEPTION 'Failure and downtime codes require Pro or Business.';
    END IF;
    IF _failure_code_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.maintenance_codes WHERE company_id = _company_id
        AND id = _failure_code_id AND code_type = 'failure'
    ) THEN RAISE EXCEPTION 'Invalid failure code.'; END IF;
    IF _downtime_code_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.maintenance_codes WHERE company_id = _company_id
        AND id = _downtime_code_id AND code_type = 'downtime'
    ) THEN RAISE EXCEPTION 'Invalid downtime code.'; END IF;
  END IF;

  IF jsonb_array_length(_parts) > 0 THEN
    PERFORM public.record_part_usage(_parts, _work_order_id, _asset_id);
  END IF;
  IF jsonb_array_length(_lubricants) > 0 THEN
    PERFORM public.record_lubricant_usage(_lubricants, _work_order_id => _work_order_id);
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_work_order_with_usage(uuid,jsonb,jsonb,uuid,uuid,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_work_order_with_usage(uuid,jsonb,jsonb,uuid,uuid,numeric) TO authenticated;
