-- RLS and work-order ownership both use work_orders.company_id. A technician changing
-- employers must not move historical usage between companies.
CREATE FUNCTION public.monthly_work_order_count(_company uuid DEFAULT public.get_user_company(auth.uid()))
RETURNS bigint LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT count(*) FROM public.work_orders
  WHERE company_id = _company
    AND created_at >= (date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');
$$;
REVOKE ALL ON FUNCTION public.monthly_work_order_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.monthly_work_order_count(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.company_within_limit_for(_company uuid, _resource text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _tier public.subscription_tier;
  _status public.subscription_status;
  _limit integer;
BEGIN
  IF _company IS NULL THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company;
  IF NOT FOUND THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing', 'active') THEN RETURN false; END IF;

  CASE _resource
    WHEN 'work_order' THEN
      _limit := CASE _tier WHEN 'starter' THEN 100 WHEN 'pro' THEN 2000 END;
      RETURN _limit IS NULL OR public.monthly_work_order_count(_company) < _limit;
    WHEN 'asset' THEN
      _limit := CASE _tier WHEN 'starter' THEN 50 WHEN 'pro' THEN 500 END;
      RETURN _limit IS NULL OR (SELECT count(*) FROM public.assets WHERE company_id = _company) < _limit;
    WHEN 'seat' THEN RETURN true;
    ELSE RETURN false;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.company_within_limit(_resource text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.company_within_limit_for(public.get_user_company(auth.uid()), _resource);
$$;

NOTIFY pgrst, 'reload schema';
