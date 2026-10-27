-- Mobile PWA / offline work-order sync + scan (feature flag only).

CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _tier public.subscription_tier; _status public.subscription_status;
BEGIN
  IF _company_id IS NULL THEN RETURN false; END IF;
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
$$;
