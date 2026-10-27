-- Parts catalog, shelf inventory, and work-order consumption (aligned with lubricants).

CREATE OR REPLACE FUNCTION public.update_parts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  part_number TEXT,
  manufacturer TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'ea',
  notes TEXT,
  quantity_on_hand NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  min_quantity NUMERIC NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

CREATE INDEX idx_parts_company ON public.parts(company_id);
CREATE INDEX idx_parts_low_stock ON public.parts(company_id)
  WHERE quantity_on_hand <= min_quantity;

ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view parts in their company"
  ON public.parts FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can insert parts"
  ON public.parts FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'parts_inventory')
  );

CREATE POLICY "Pro users can update parts"
  ON public.parts FOR UPDATE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'parts_inventory')
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'parts_inventory')
  );

CREATE POLICY "Pro users can delete parts"
  ON public.parts FOR DELETE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'parts_inventory')
  );

CREATE TRIGGER trg_parts_updated_at
  BEFORE UPDATE ON public.parts
  FOR EACH ROW EXECUTE FUNCTION public.update_parts_updated_at();

CREATE TABLE public.part_assets (
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (part_id, asset_id)
);

CREATE INDEX idx_part_assets_asset ON public.part_assets(asset_id);
ALTER TABLE public.part_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part assets in their company"
  ON public.part_assets FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can manage part assets"
  ON public.part_assets FOR ALL
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'parts_inventory')
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'parts_inventory')
  );

CREATE TABLE public.part_stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('receive', 'adjustment')),
  quantity_delta NUMERIC NOT NULL,
  quantity_before NUMERIC NOT NULL,
  quantity_after NUMERIC NOT NULL,
  notes TEXT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_part_stock_adj_company ON public.part_stock_adjustments(company_id, created_at DESC);
ALTER TABLE public.part_stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part stock adjustments in their company"
  ON public.part_stock_adjustments FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE TABLE public.part_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE RESTRICT,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_by UUID DEFAULT auth.uid(),
  notes TEXT
);

CREATE INDEX idx_part_usage_company ON public.part_usage_logs(company_id, used_at DESC);
CREATE INDEX idx_part_usage_wo ON public.part_usage_logs(work_order_id);
ALTER TABLE public.part_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part usage in their company"
  ON public.part_usage_logs FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE OR REPLACE FUNCTION public.has_feature(_company_id uuid, _feature text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier public.subscription_tier;
  _status public.subscription_status;
BEGIN
  IF _company_id IS NULL THEN RETURN false; END IF;
  SELECT tier, status INTO _tier, _status FROM public.subscriptions WHERE company_id = _company_id;
  IF _tier IS NULL THEN _tier := 'starter'; _status := 'trialing'; END IF;
  IF _status NOT IN ('trialing','active') THEN RETURN false; END IF;
  RETURN CASE _feature
    WHEN 'analytics'           THEN _tier IN ('pro','business')
    WHEN 'automations'         THEN _tier IN ('pro','business')
    WHEN 'api'                 THEN _tier = 'business'
    WHEN 'sso'                 THEN _tier = 'business'
    WHEN 'lubricant_tracking'  THEN _tier IN ('pro','business')
    WHEN 'parts_inventory'     THEN _tier IN ('pro','business')
    ELSE false
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_part_stock(
  _part_id uuid,
  _adjustment_type text,
  _quantity_delta numeric,
  _notes text DEFAULT NULL
)
RETURNS public.part_stock_adjustments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _before numeric;
  _after numeric;
  _row public.part_stock_adjustments%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF _adjustment_type NOT IN ('receive', 'adjustment') THEN RAISE EXCEPTION 'adjustment_type must be receive or adjustment'; END IF;
  IF _quantity_delta IS NULL OR _quantity_delta = 0 THEN RAISE EXCEPTION 'quantity_delta must be non-zero'; END IF;
  IF _adjustment_type = 'receive' AND _quantity_delta < 0 THEN RAISE EXCEPTION 'receive must be positive'; END IF;

  SELECT p.company_id, p.quantity_on_hand INTO _company_id, _before
  FROM public.parts AS p
  WHERE p.id = _part_id AND p.company_id = public.get_user_company(_uid)
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Part not found'; END IF;
  IF NOT public.has_feature(_company_id, 'parts_inventory') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Parts inventory requires Pro or Business';
  END IF;

  _after := _before + _quantity_delta;
  IF _after < 0 THEN RAISE EXCEPTION 'Stock cannot go below zero'; END IF;

  UPDATE public.parts SET quantity_on_hand = _after WHERE id = _part_id;

  INSERT INTO public.part_stock_adjustments (
    company_id, part_id, adjustment_type, quantity_delta, quantity_before, quantity_after, notes, created_by
  ) VALUES (
    _company_id, _part_id, _adjustment_type, _quantity_delta, _before, _after, NULLIF(_notes, ''), _uid
  ) RETURNING * INTO _row;
  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_part_stock(uuid, text, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_part_stock(uuid, text, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_part_usage(
  _lines jsonb,
  _work_order_id uuid DEFAULT NULL,
  _asset_id uuid DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _line record;
  _before numeric;
  _after numeric;
  _count integer := 0;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated'; END IF;
  IF jsonb_typeof(_lines) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'lines must be a JSON array'; END IF;

  _company_id := public.get_user_company(_uid);
  IF NOT public.has_feature(_company_id, 'parts_inventory') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Parts inventory requires Pro or Business';
  END IF;

  IF _work_order_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.work_orders wo WHERE wo.id = _work_order_id AND wo.company_id = _company_id
  ) THEN RAISE EXCEPTION 'Work order not found'; END IF;

  FOR _line IN
    SELECT * FROM jsonb_to_recordset(_lines) AS x(part_id uuid, quantity numeric)
  LOOP
    IF _line.quantity IS NULL OR _line.quantity <= 0 THEN CONTINUE; END IF;

    SELECT p.quantity_on_hand INTO _before FROM public.parts p
    WHERE p.id = _line.part_id AND p.company_id = _company_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Part not found'; END IF;

    _after := _before - _line.quantity;
    IF _after < 0 THEN RAISE EXCEPTION 'Insufficient stock for part %', _line.part_id; END IF;

    UPDATE public.parts SET quantity_on_hand = _after WHERE id = _line.part_id;

    INSERT INTO public.part_usage_logs (company_id, part_id, work_order_id, asset_id, quantity, used_by, notes)
    VALUES (_company_id, _line.part_id, _work_order_id, _asset_id, _line.quantity, _uid, NULLIF(_notes, ''));
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_part_usage(jsonb, uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_part_usage(jsonb, uuid, uuid, text) TO authenticated;
