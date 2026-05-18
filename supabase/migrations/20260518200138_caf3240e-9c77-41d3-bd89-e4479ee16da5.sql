-- Enforce tier limits at the database level using existing company_within_limit()
CREATE OR REPLACE FUNCTION public.enforce_asset_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.company_within_limit('asset') THEN
    RAISE EXCEPTION 'plan_limit_reached: asset limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.enforce_work_order_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.company_within_limit('work_order') THEN
    RAISE EXCEPTION 'plan_limit_reached: monthly work order limit reached for your plan' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_enforce_asset_limit ON public.assets;
CREATE TRIGGER trg_enforce_asset_limit
  BEFORE INSERT ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.enforce_asset_limit();

DROP TRIGGER IF EXISTS trg_enforce_work_order_limit ON public.work_orders;
CREATE TRIGGER trg_enforce_work_order_limit
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_work_order_limit();