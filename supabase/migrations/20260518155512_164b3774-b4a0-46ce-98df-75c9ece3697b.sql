CREATE TYPE public.subscription_tier AS ENUM ('starter', 'pro', 'business');
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
CREATE TYPE public.billing_interval AS ENUM ('month', 'year');

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE,
  tier public.subscription_tier NOT NULL DEFAULT 'starter',
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  billing_interval public.billing_interval NOT NULL DEFAULT 'month',
  included_seats integer NOT NULL DEFAULT 2,
  paid_seats integer NOT NULL DEFAULT 0,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_company ON public.subscriptions(company_id);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_cust ON public.subscriptions(stripe_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view company subscription"
ON public.subscriptions FOR SELECT
USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins can insert company subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Admins can update company subscription"
ON public.subscriptions FOR UPDATE
USING (
  company_id = public.get_user_company(auth.uid())
  AND public.has_role(auth.uid(), 'administrator'::app_role)
);

-- Inline trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_subscriptions_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_subscriptions_updated_at();

CREATE OR REPLACE FUNCTION public.get_company_subscription()
RETURNS TABLE (
  tier public.subscription_tier,
  status public.subscription_status,
  billing_interval public.billing_interval,
  included_seats integer,
  paid_seats integer,
  total_seats integer,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  is_active boolean,
  asset_limit integer,
  work_order_limit integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    s.tier, s.status, s.billing_interval, s.included_seats, s.paid_seats,
    (s.included_seats + s.paid_seats) AS total_seats,
    s.trial_ends_at, s.current_period_end, s.cancel_at_period_end,
    (s.status IN ('trialing','active')) AS is_active,
    CASE s.tier WHEN 'starter' THEN 50 WHEN 'pro' THEN 500 WHEN 'business' THEN NULL END AS asset_limit,
    CASE s.tier WHEN 'starter' THEN 100 WHEN 'pro' THEN 2000 WHEN 'business' THEN NULL END AS work_order_limit
  FROM public.subscriptions s
  WHERE s.company_id = public.get_user_company(auth.uid())
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.company_within_limit(_resource text)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _company uuid := public.get_user_company(auth.uid());
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