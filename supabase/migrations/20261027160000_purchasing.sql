-- Purchase requests, POs, receiving into parts inventory, tax on POs.

CREATE TABLE public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  notes TEXT,
  requested_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company purchase requests" ON public.purchase_requests FOR ALL
  USING (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'purchasing'))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'purchasing'));

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.purchase_requests(id) ON DELETE SET NULL,
  vendor_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','partial','received','cancelled')),
  tax_rate_percent NUMERIC NOT NULL DEFAULT 0 CHECK (tax_rate_percent >= 0),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company purchase orders" ON public.purchase_orders FOR ALL
  USING (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'purchasing'))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'purchasing'));

CREATE TABLE public.purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  part_id UUID REFERENCES public.parts(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  qty_received NUMERIC NOT NULL DEFAULT 0 CHECK (qty_received >= 0)
);

ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company PO lines" ON public.purchase_order_lines FOR ALL
  USING (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'purchasing'))
  WITH CHECK (company_id = public.get_user_company(auth.uid()) AND public.has_feature(company_id, 'purchasing'));

CREATE OR REPLACE FUNCTION public.recalculate_purchase_order_totals(_po_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sub numeric; _tax_rate numeric; _tax numeric;
BEGIN
  SELECT COALESCE(SUM(quantity * unit_cost), 0) INTO _sub FROM public.purchase_order_lines WHERE purchase_order_id = _po_id;
  SELECT tax_rate_percent INTO _tax_rate FROM public.purchase_orders WHERE id = _po_id;
  _tax := round(_sub * COALESCE(_tax_rate, 0) / 100.0, 2);
  UPDATE public.purchase_orders SET subtotal = _sub, tax_amount = _tax, total = _sub + _tax WHERE id = _po_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.receive_purchase_order_line(_line_id uuid, _qty numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _company_id uuid; _line record;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'qty must be positive'; END IF;
  SELECT l.*, po.company_id AS po_company INTO _line FROM public.purchase_order_lines l
  JOIN public.purchase_orders po ON po.id = l.purchase_order_id
  WHERE l.id = _line_id AND po.company_id = public.get_user_company(_uid) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Line not found'; END IF;
  _company_id := _line.po_company;
  IF NOT public.has_feature(_company_id, 'purchasing') THEN RAISE EXCEPTION 'Purchasing not enabled'; END IF;
  IF _line.qty_received + _qty > _line.quantity THEN RAISE EXCEPTION 'Cannot receive more than ordered'; END IF;
  UPDATE public.purchase_order_lines SET qty_received = qty_received + _qty WHERE id = _line_id;
  IF _line.part_id IS NOT NULL THEN
    PERFORM public.adjust_part_stock(_line.part_id, 'receive', _qty, 'PO receipt');
  END IF;
END;
$$;

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
    ELSE false END;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_lines TO authenticated;
REVOKE ALL ON FUNCTION public.recalculate_purchase_order_totals(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_purchase_order_totals(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.receive_purchase_order_line(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.receive_purchase_order_line(uuid, numeric) TO authenticated;
