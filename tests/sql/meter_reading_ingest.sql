-- Run with psql -v ON_ERROR_STOP=1 against a disposable migrated database.
BEGIN;
SET LOCAL plpgsql.check_asserts = on;
DO $$
DECLARE
  _company uuid := gen_random_uuid();
  _other uuid := gen_random_uuid();
  _actor uuid := gen_random_uuid();
  _meter uuid := gen_random_uuid();
  _asset uuid := gen_random_uuid();
  _other_asset uuid := gen_random_uuid();
  _other_meter uuid := gen_random_uuid();
  _checklist uuid := gen_random_uuid();
  _hash text := 'fixture-' || gen_random_uuid()::text;
  _when timestamptz := '2026-11-21T21:05:06.123456-06:00';
  _first jsonb;
  _replay jsonb;
  _rpc text := 'public.ingest_meter_reading(text,uuid,text,numeric,text,timestamptz,text)';
BEGIN
  ASSERT NOT has_function_privilege('anon', _rpc, 'EXECUTE');
  ASSERT NOT has_function_privilege('authenticated', _rpc, 'EXECUTE');
  ASSERT has_function_privilege('service_role', _rpc, 'EXECUTE');
  INSERT INTO public.companies (id, name) VALUES (_company, 'Test fleet'), (_other, 'Test facilities');
  INSERT INTO auth.users (id, email) VALUES (_actor, _actor::text || '@example.test');
  UPDATE public.profiles SET company_id = _company WHERE id = _actor;
  INSERT INTO public.subscriptions (company_id, tier, status) VALUES (_company, 'business', 'active')
    ON CONFLICT (company_id) DO UPDATE SET tier = 'business', status = 'active';
  INSERT INTO public.api_keys (company_id, created_by, name, key_hash, key_prefix)
    VALUES (_company, _actor, 'Test feed', _hash, 'mke_live_test');
  INSERT INTO public.assets (id, company_id, name) VALUES (_asset, _company, 'Truck'), (_other_asset, _other, 'Pump');
  INSERT INTO public.asset_meters (id, company_id, asset_id, name, unit)
    VALUES (_meter, _company, _asset, 'Odometer', 'mi'), (_other_meter, _other, _other_asset, 'Usage', 'hrs');
  INSERT INTO public.checklists (id, company_id, created_by, name) VALUES (_checklist, _company, _actor, 'Truck service');
  INSERT INTO public.checklist_assets (asset_id, checklist_id) VALUES (_asset, _checklist);
  INSERT INTO public.checklist_meter_rules (checklist_id, company_id, meter_id, interval_units, auto_create_work_order)
    VALUES (_checklist, _company, _meter, 100, true);

  -- An invited administrator can have membership ahead of the profile backfill.
  INSERT INTO public.user_roles (user_id, company_id, role) VALUES (_actor, _company, 'administrator');
  UPDATE public.profiles SET company_id = NULL WHERE id = _actor;
  _first := public.ingest_meter_reading(_hash, _meter, 'device-123', 100, 'mi', _when);
  ASSERT (_first->>'work_orders_created')::int = 1 AND (_first->>'replayed')::boolean = false;
  ASSERT EXISTS (SELECT 1 FROM public.meter_readings WHERE id = (_first->>'reading_id')::uuid
    AND recorded_at = _when AND recorded_by = _actor AND reading_value = 100);
  PERFORM public.ingest_meter_reading(_hash, _meter, 'device-124', 101, 'mi', _when + interval '1 minute');
  _replay := public.ingest_meter_reading(_hash, _meter, 'device-123', 100, 'mi', _when);
  ASSERT _replay->>'reading_id' = _first->>'reading_id' AND (_replay->>'replayed')::boolean;
  ASSERT (_replay->>'work_orders_created')::int = 1;
  ASSERT (SELECT count(*) FROM public.meter_readings WHERE meter_id = _meter) = 2;
  ASSERT (SELECT count(*) FROM public.work_orders WHERE asset_id = _asset) = 1;
  ASSERT EXISTS (SELECT 1 FROM public.api_keys WHERE key_hash = _hash AND last_used_at IS NOT NULL);

  BEGIN PERFORM public.ingest_meter_reading(_hash, _meter, 'device-123', 100, 'mi', _when, 'changed');
    RAISE EXCEPTION 'Conflicting replay accepted'; EXCEPTION WHEN SQLSTATE 'PT409' THEN NULL; END;
  BEGIN PERFORM public.ingest_meter_reading(_hash, _meter, 'device-125', 99, 'mi', _when);
    RAISE EXCEPTION 'Decreasing reading accepted'; EXCEPTION WHEN SQLSTATE 'PT409' THEN NULL; END;
  BEGIN PERFORM public.ingest_meter_reading(_hash, _meter, 'device-125', 102, 'km', _when);
    RAISE EXCEPTION 'Mismatched unit accepted'; EXCEPTION WHEN SQLSTATE 'PT422' THEN NULL; END;
  BEGIN PERFORM public.ingest_meter_reading(_hash, _other_meter, 'device-125', 102, 'hrs', _when);
    RAISE EXCEPTION 'Other company meter accepted'; EXCEPTION WHEN SQLSTATE 'PT404' THEN NULL; END;
  UPDATE public.profiles SET company_id = _other WHERE id = _actor;
  BEGIN PERFORM public.ingest_meter_reading(_hash, _meter, 'device-123', 100, 'mi', _when);
    RAISE EXCEPTION 'Moved key creator accepted'; EXCEPTION WHEN SQLSTATE 'PT401' THEN NULL; END;
  UPDATE public.profiles SET company_id = _company WHERE id = _actor;
  UPDATE public.subscriptions SET tier = 'pro' WHERE company_id = _company;
  BEGIN PERFORM public.ingest_meter_reading(_hash, _meter, 'device-123', 100, 'mi', _when);
    RAISE EXCEPTION 'Downgraded company accepted'; EXCEPTION WHEN SQLSTATE 'PT403' THEN NULL; END;
  UPDATE public.api_keys SET revoked_at = now() WHERE key_hash = _hash;
  BEGIN PERFORM public.ingest_meter_reading(_hash, _meter, 'device-123', 100, 'mi', _when);
    RAISE EXCEPTION 'Revoked key accepted'; EXCEPTION WHEN SQLSTATE 'PT401' THEN NULL; END;
END;
$$;
ROLLBACK;
