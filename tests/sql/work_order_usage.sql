-- Run with psql -v ON_ERROR_STOP=1 against a disposable migrated database.
BEGIN;
SET LOCAL plpgsql.check_asserts = on;
DO $$
DECLARE
  _owner uuid := gen_random_uuid();
  _other uuid := gen_random_uuid();
  _actor uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.companies (id, name) VALUES (_owner, 'Quota test'), (_other, 'Other workspace');
  INSERT INTO auth.users (id, email) VALUES (_actor, _actor::text || '@example.test');
  UPDATE public.profiles SET company_id = _owner WHERE id = _actor;
  INSERT INTO public.subscriptions (company_id, tier, status) VALUES (_owner, 'starter', 'active')
  ON CONFLICT (company_id) DO UPDATE SET tier = 'starter', status = 'active';
  INSERT INTO public.work_orders (company_id, created_by, title, description)
  SELECT _owner, _actor, 'This month', '' FROM generate_series(1, 100);
  INSERT INTO public.work_orders (company_id, created_by, title, description, created_at)
  VALUES (_owner, _actor, 'Previous month', '', date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' - interval '1 second');
  UPDATE public.profiles SET company_id = _other WHERE id = _actor;
  PERFORM set_config('request.jwt.claim.sub', _actor::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _actor, 'role', 'authenticated')::text, true);
  ASSERT public.monthly_work_order_count() = 0, 'billing attributed orders to the new workspace';
  ASSERT public.monthly_work_order_count(_owner) = 100, 'old workspace lost usage';
  ASSERT NOT public.company_within_limit_for(_owner, 'work_order'), 'owner should be at Starter limit';
  ASSERT public.company_within_limit('work_order'), 'new workspace should have capacity';
END;
$$;
ROLLBACK;
