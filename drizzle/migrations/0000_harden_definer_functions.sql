CREATE OR REPLACE FUNCTION public.get_user_company(_user_id uuid)
 RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid()
         AND COALESCE(auth.role(), '') <> 'service_role' THEN NULL
    ELSE COALESCE(
      (SELECT p.company_id FROM public.profiles p WHERE p.id = _user_id),
      (SELECT ur.company_id FROM public.user_roles ur WHERE ur.user_id = _user_id
       ORDER BY ur.created_at DESC NULLS LAST LIMIT 1))
  END;
$function$;
REVOKE EXECUTE ON FUNCTION public.get_user_company(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_user_company(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
 RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _tier public.subscription_tier; _status public.subscription_status;
BEGIN
  IF _company_id IS NULL THEN RETURN false; END IF;
  IF auth.uid() IS NOT NULL AND COALESCE(auth.role(), '') <> 'service_role'
     AND _company_id IS DISTINCT FROM public.get_user_company(auth.uid()) THEN
    RETURN false;
  END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company_id;
  IF _tier IS NULL THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  RETURN CASE _feature
    WHEN 'analytics' THEN _tier IN ('pro','business')
    WHEN 'automations' THEN _tier IN ('pro','business')
    WHEN 'api' THEN _tier = 'business'
    WHEN 'sso' THEN _tier = 'business'
    WHEN 'lubricant_tracking' THEN _tier IN ('pro','business')
    WHEN 'parts_inventory' THEN _tier IN ('pro','business')
    WHEN 'meter_based_pm' THEN _tier IN ('pro','business')
    WHEN 'bulk_pm_generation' THEN _tier IN ('pro','business')
    WHEN 'purchasing' THEN _tier IN ('pro','business')
    WHEN 'failure_downtime_codes' THEN _tier IN ('pro','business')
    WHEN 'mobile_pwa_offline' THEN _tier IN ('pro','business')
    ELSE false END;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.has_feature(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_feature(uuid, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.company_within_limit_for(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.company_within_limit_for(uuid, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.dispatch_notification_event(text, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_notification_event(text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.create_pm_work_orders_from_preview(_items jsonb)
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid(); _company_id uuid; _company_tz text; _item record;
  _count integer := 0; _due_local timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF jsonb_typeof(_items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'items must be array'; END IF;
  _company_id := public.get_user_company(_uid);
  IF NOT public.has_feature(_company_id, 'bulk_pm_generation') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Bulk PM generation requires Pro or Business';
  END IF;
  SELECT COALESCE(c.timezone, 'UTC') INTO _company_tz FROM public.companies c WHERE c.id = _company_id;
  FOR _item IN SELECT * FROM jsonb_to_recordset(_items) AS x(checklist_id uuid, asset_id uuid, due_at timestamptz)
  LOOP
    IF _item.asset_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.assets a WHERE a.id = _item.asset_id AND a.company_id = _company_id
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Asset not found in company';
    END IF;
    _due_local := (((_item.due_at AT TIME ZONE _company_tz)::date + time '12:00') AT TIME ZONE _company_tz);
    INSERT INTO public.work_orders (company_id, title, description, status, priority, asset_id, due_date, created_by)
    SELECT _company_id, 'PM: ' || c.name, 'Auto-generated from PM schedule', 'pending', 'medium',
           _item.asset_id, _due_local, _uid
    FROM public.checklists c WHERE c.id = _item.checklist_id AND c.company_id = _company_id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$function$;