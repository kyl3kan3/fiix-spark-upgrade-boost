-- Run with psql -v ON_ERROR_STOP=1 against a disposable migrated database.
BEGIN;
SET LOCAL plpgsql.check_asserts = on;
DO $$
DECLARE
  _company uuid := gen_random_uuid();
  _actor uuid := gen_random_uuid();
  _asset uuid := gen_random_uuid();
  _job uuid := gen_random_uuid();
  _part uuid := gen_random_uuid();
  _oil uuid := gen_random_uuid();
  _parts jsonb := jsonb_build_array(jsonb_build_object('part_id', _part, 'quantity', 2));
  _lubricants jsonb := jsonb_build_array(jsonb_build_object('lubricant_id', _oil, 'quantity', 3));
BEGIN
  INSERT INTO public.companies (id, name) VALUES (_company, 'Closeout test');
  INSERT INTO auth.users (id, email) VALUES (_actor, _actor::text || '@example.test');
  UPDATE public.profiles SET company_id = _company WHERE id = _actor;
  INSERT INTO public.subscriptions (company_id, tier, status) VALUES (_company, 'pro', 'active')
    ON CONFLICT (company_id) DO UPDATE SET tier = 'pro', status = 'active';
  PERFORM set_config('request.jwt.claim.sub', _actor::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _actor, 'role', 'authenticated')::text, true);
  INSERT INTO public.assets (id, company_id, name) VALUES (_asset, _company, 'Pump');
  INSERT INTO public.work_orders (id, company_id, asset_id, created_by, status, title, description)
    VALUES (_job, _company, _asset, _actor, 'in_progress', 'Service pump', 'Replace belt and oil');
  INSERT INTO public.parts (id, company_id, name, quantity_on_hand) VALUES (_part, _company, 'Belt', 4);
  INSERT INTO public.lubricants (id, company_id, name, quantity_on_hand) VALUES (_oil, _company, 'Oil', 1);

  BEGIN
    PERFORM public.complete_work_order_with_usage(_job, _parts, _lubricants);
    RAISE EXCEPTION 'An out-of-stock lubricant should fail the closeout';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Insufficient stock for lubricant%' THEN RAISE; END IF;
  END;
  ASSERT (SELECT status = 'in_progress' FROM public.work_orders WHERE id = _job);
  ASSERT (SELECT quantity_on_hand = 4 FROM public.parts WHERE id = _part), 'part deduction survived rollback';
  ASSERT NOT EXISTS (SELECT 1 FROM public.part_usage_logs WHERE work_order_id = _job);

  UPDATE public.lubricants SET quantity_on_hand = 5 WHERE id = _oil;
  ASSERT public.complete_work_order_with_usage(_job, _parts, _lubricants, _downtime_minutes => 30);
  ASSERT NOT public.complete_work_order_with_usage(_job, _parts, _lubricants, _downtime_minutes => 60),
    'replayed completion was applied twice';
  ASSERT (SELECT status = 'completed' AND downtime_minutes = 30 FROM public.work_orders WHERE id = _job);
  ASSERT (SELECT quantity_on_hand = 2 FROM public.parts WHERE id = _part);
  ASSERT (SELECT quantity_on_hand = 2 FROM public.lubricants WHERE id = _oil);
  ASSERT (SELECT count(*) = 1 FROM public.part_usage_logs WHERE work_order_id = _job AND asset_id = _asset);
  ASSERT (SELECT count(*) = 1 FROM public.lubricant_usage_logs WHERE work_order_id = _job AND asset_id = _asset);
END;
$$;
ROLLBACK;
