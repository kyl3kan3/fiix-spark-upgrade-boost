-- Run with psql -v ON_ERROR_STOP=1 against a disposable migrated database.
BEGIN;
SET LOCAL plpgsql.check_asserts = on;

-- Model a full plan without filling a workspace with thousands of rows.
CREATE OR REPLACE FUNCTION public.company_within_limit_for(_company uuid, _resource text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT _resource <> 'work_order' OR current_setting('test.work_order_capacity', true) IS DISTINCT FROM 'full';
$$;

DO $$
DECLARE
  _company uuid := gen_random_uuid();
  _other uuid := gen_random_uuid();
  _actor uuid := gen_random_uuid();
  _asset uuid := gen_random_uuid();
  _checklist uuid := gen_random_uuid();
  _meter uuid := gen_random_uuid();
  _other_meter uuid := gen_random_uuid();
  _used_checklist uuid := gen_random_uuid();
  _used_meter uuid := gen_random_uuid();
  _reading public.meter_readings;
BEGIN
  INSERT INTO public.companies (id, name) VALUES (_company, 'Meter test'), (_other, 'Other workspace');
  INSERT INTO auth.users (id, email) VALUES (_actor, _actor::text || '@example.test');
  UPDATE public.profiles SET company_id = _company WHERE id = _actor;
  INSERT INTO public.subscriptions (company_id, tier, status) VALUES (_company, 'pro', 'active')
  ON CONFLICT (company_id) DO UPDATE SET tier = 'pro', status = 'active';
  INSERT INTO public.assets (id, company_id, name) VALUES (_asset, _company, 'Test truck');
  INSERT INTO public.checklists (id, company_id, created_by, name) VALUES (_checklist, _company, _actor, 'Oil service');
  INSERT INTO public.checklist_assets (asset_id, checklist_id) VALUES (_asset, _checklist);
  INSERT INTO public.asset_meters (id, company_id, asset_id, name, unit) VALUES (_meter, _company, _asset, 'Odometer', 'mi');
  INSERT INTO public.checklist_meter_rules (checklist_id, company_id, meter_id, interval_units)
  VALUES (_checklist, _company, _meter, 500);
  PERFORM set_config('request.jwt.claim.sub', _actor::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _actor, 'role', 'authenticated')::text, true);

  _reading := public.record_asset_meter_reading(_meter, 499);
  ASSERT _reading.work_orders_created = 0, 'service was not due';
  _reading := public.record_asset_meter_reading(_meter, 510);
  ASSERT _reading.work_orders_created = 0, 'legacy rule must remain due-only';
  ASSERT EXISTS (SELECT 1 FROM public.checklist_schedules WHERE checklist_id = _checklist AND next_due_at <= now());
  UPDATE public.checklist_meter_rules SET auto_create_work_order = true WHERE checklist_id = _checklist;
  _reading := public.record_asset_meter_reading(_meter, 510);
  ASSERT _reading.work_orders_created = 1, 'already-overdue enabled rule must generate';
  ASSERT EXISTS (SELECT 1 FROM public.work_orders WHERE meter_checklist_id = _checklist
    AND company_id = _company AND asset_id = _asset AND created_by = _actor AND status = 'pending');
  _reading := public.record_asset_meter_reading(_meter, 2000);
  ASSERT _reading.work_orders_created = 0, 'missed intervals must not duplicate unserviced work';

  INSERT INTO public.checklist_submissions (checklist_id, submitted_by) VALUES (_checklist, _actor);
  _reading := public.record_asset_meter_reading(_meter, 2499);
  ASSERT _reading.work_orders_created = 0, 'next cycle should use serviced reading';
  PERFORM set_config('test.work_order_capacity','full',true);
  _reading := public.record_asset_meter_reading(_meter, 2500);
  ASSERT _reading.work_orders_created = 0 AND _reading.work_orders_deferred = 1, 'full cap must preserve reading and due state';
  ASSERT EXISTS (SELECT 1 FROM public.meter_readings WHERE id = _reading.id AND reading_value = 2500);
  PERFORM set_config('test.work_order_capacity','available',true);
  _reading := public.record_asset_meter_reading(_meter, 2500);
  ASSERT _reading.work_orders_created = 1, 'same reading should retry a deferred order';
  _reading := public.record_asset_meter_reading(_meter, 2500);
  ASSERT _reading.work_orders_created = 0, 'retry created an extra order';

  INSERT INTO public.asset_meters (id, company_id, asset_id, name, current_reading)
  VALUES (_other_meter, _company, _asset, 'Hours', 100);
  UPDATE public.checklist_meter_rules SET meter_id = _other_meter WHERE checklist_id = _checklist;
  ASSERT EXISTS (SELECT 1 FROM public.checklist_meter_rules WHERE checklist_id = _checklist
    AND last_service_reading = 100 AND work_order_created_at IS NULL);
  UPDATE public.checklists SET is_active = false WHERE id = _checklist;
  _reading := public.record_asset_meter_reading(_other_meter, 600);
  ASSERT _reading.work_orders_created = 0, 'inactive checklist generated work';
  UPDATE public.checklists SET is_active = true WHERE id = _checklist;
  DELETE FROM public.checklist_assets WHERE checklist_id = _checklist AND asset_id = _asset;
  _reading := public.record_asset_meter_reading(_other_meter, 601);
  ASSERT _reading.work_orders_created = 0, 'unlinked asset generated work';
  ASSERT (SELECT count(*) FROM public.work_orders WHERE company_id = _company) = 2;

  INSERT INTO public.checklists (id, company_id, created_by, name) VALUES (_used_checklist, _company, _actor, 'Used vehicle service');
  INSERT INTO public.checklist_assets (asset_id, checklist_id) VALUES (_asset, _used_checklist);
  INSERT INTO public.asset_meters (id, company_id, asset_id, name, unit, current_reading)
  VALUES (_used_meter, _company, _asset, 'Used vehicle odometer', 'mi', 62000);
  INSERT INTO public.checklist_meter_rules (checklist_id, company_id, meter_id, interval_units)
  VALUES (_used_checklist, _company, _used_meter, 5000);
  ASSERT (SELECT last_service_reading FROM public.checklist_meter_rules WHERE checklist_id = _used_checklist) = 62000,
    'clients that omit the initial baseline should use the current meter reading';
  DELETE FROM public.checklist_meter_rules WHERE checklist_id = _used_checklist;
  PERFORM public.save_checklist_meter_rule(_used_checklist, _used_meter, 5000, true);
  ASSERT (SELECT last_service_reading FROM public.checklist_meter_rules WHERE checklist_id = _used_checklist) = 62000;
  _reading := public.record_asset_meter_reading(_used_meter, 62000);
  ASSERT _reading.work_orders_created = 0, 'a new rule on a used vehicle must start at its current mileage';
  DELETE FROM public.checklist_meter_rules WHERE checklist_id = _used_checklist;
  PERFORM public.save_checklist_meter_rule(_used_checklist, _used_meter, 5000, true, NULL, 60000);
  _reading := public.record_asset_meter_reading(_used_meter, 64999);
  ASSERT _reading.work_orders_created = 0;
  _reading := public.record_asset_meter_reading(_used_meter, 65000);
  ASSERT _reading.work_orders_created = 1, 'historical service at 60,000 should be due at 65,000';

  INSERT INTO public.checklist_submissions (checklist_id, submitted_by) VALUES (_used_checklist, _actor);
  PERFORM public.save_checklist_meter_rule(_used_checklist, _used_meter, 4000, false, _used_meter, 60000);
  ASSERT (SELECT last_service_reading FROM public.checklist_meter_rules WHERE checklist_id = _used_checklist) = 65000,
    'saving settings must preserve service submitted while the form was open';
  PERFORM public.save_checklist_meter_rule(_used_checklist, _other_meter, 100, true, _used_meter, 550);
  ASSERT (SELECT last_service_reading FROM public.checklist_meter_rules WHERE checklist_id = _used_checklist) = 550,
    'a replacement meter can use its own historical baseline';
  BEGIN
    PERFORM public.save_checklist_meter_rule(_used_checklist, _used_meter, 1000, true, _other_meter, 65001);
    RAISE EXCEPTION 'accepted service above the current reading' USING ERRCODE = 'XX000';
  EXCEPTION WHEN raise_exception THEN
    ASSERT SQLERRM LIKE 'Last service reading must be%';
  END;

  BEGIN
    PERFORM public.record_asset_meter_reading(_meter, 2000);
    RAISE EXCEPTION 'accepted decreasing reading' USING ERRCODE = 'XX000';
  EXCEPTION WHEN raise_exception THEN
    ASSERT SQLERRM LIKE 'Reading cannot be less%';
  END;
  UPDATE public.profiles SET company_id = _other WHERE id = _actor;
  BEGIN
    PERFORM public.record_asset_meter_reading(_meter, 2501);
    RAISE EXCEPTION 'accepted another tenant meter' USING ERRCODE = 'XX000';
  EXCEPTION WHEN raise_exception THEN
    ASSERT SQLERRM = 'Meter not found';
  END;
  ASSERT NOT has_function_privilege('authenticated',
    'public.record_company_meter_reading(uuid,uuid,uuid,numeric,text)', 'EXECUTE');
END;
$$;
ROLLBACK;
