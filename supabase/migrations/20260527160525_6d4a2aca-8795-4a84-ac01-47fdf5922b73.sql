-- Generalized limit check that accepts an explicit company_id
CREATE OR REPLACE FUNCTION public.company_within_limit_for(_company uuid, _resource text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier public.subscription_tier;
  _status public.subscription_status;
  _limit integer;
  _count integer;
BEGIN
  IF _company IS NULL THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company;
  IF _tier IS NULL THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;

  IF _resource = 'asset' THEN
    _limit := CASE _tier WHEN 'starter' THEN 50 WHEN 'pro' THEN 500 ELSE NULL END;
    IF _limit IS NULL THEN RETURN true; END IF;
    SELECT count(*) INTO _count FROM public.assets WHERE company_id = _company;
    RETURN _count < _limit;
  ELSIF _resource = 'work_order' THEN
    _limit := CASE _tier WHEN 'starter' THEN 100 WHEN 'pro' THEN 2000 ELSE NULL END;
    IF _limit IS NULL THEN RETURN true; END IF;
    SELECT count(*) INTO _count FROM public.work_orders
      WHERE created_by IN (SELECT id FROM public.profiles WHERE company_id = _company)
        AND created_at >= date_trunc('month', now());
    RETURN _count < _limit;
  ELSIF _resource = 'seat' THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Asset trigger: bypass when no authenticated user (service role / direct SQL), use NEW.company_id
CREATE OR REPLACE FUNCTION public.enforce_asset_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NOT public.company_within_limit_for(NEW.company_id, 'asset') THEN
    RAISE EXCEPTION 'plan_limit_reached: asset limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

-- Work order trigger: same treatment, resolve company from created_by
CREATE OR REPLACE FUNCTION public.enforce_work_order_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  SELECT company_id INTO _company FROM public.profiles WHERE id = COALESCE(NEW.created_by, auth.uid());
  IF NOT public.company_within_limit_for(_company, 'work_order') THEN
    RAISE EXCEPTION 'plan_limit_reached: monthly work order limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;