-- Lubricant catalog, shelf inventory, stock adjustments, and PM usage logging.
-- Pro/Business feature gated via public.has_feature(..., 'lubricant_tracking').

CREATE OR REPLACE FUNCTION public.update_lubricants_updated_at()
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

CREATE TABLE public.lubricants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lubricant_type TEXT,
  manufacturer TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'L',
  notes TEXT,
  quantity_on_hand NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  reorder_level NUMERIC NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

CREATE INDEX idx_lubricants_company ON public.lubricants(company_id);
CREATE INDEX idx_lubricants_low_stock ON public.lubricants(company_id)
  WHERE quantity_on_hand <= reorder_level;

ALTER TABLE public.lubricants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lubricants in their company"
  ON public.lubricants FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can insert lubricants"
  ON public.lubricants FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  );

CREATE POLICY "Pro users can update lubricants"
  ON public.lubricants FOR UPDATE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  );

CREATE POLICY "Pro users can delete lubricants"
  ON public.lubricants FOR DELETE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  );

CREATE TRIGGER trg_lubricants_updated_at
  BEFORE UPDATE ON public.lubricants
  FOR EACH ROW EXECUTE FUNCTION public.update_lubricants_updated_at();

-- Many-to-many: lubricant <-> asset
CREATE TABLE public.lubricant_assets (
  lubricant_id UUID NOT NULL REFERENCES public.lubricants(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lubricant_id, asset_id)
);

CREATE INDEX idx_lubricant_assets_asset ON public.lubricant_assets(asset_id);
ALTER TABLE public.lubricant_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lubricant assets in their company"
  ON public.lubricant_assets FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can manage lubricant assets"
  ON public.lubricant_assets FOR ALL
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  );

-- Many-to-many: lubricant <-> checklist (lubrication PM)
CREATE TABLE public.lubricant_checklists (
  lubricant_id UUID NOT NULL REFERENCES public.lubricants(id) ON DELETE CASCADE,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lubricant_id, checklist_id)
);

CREATE INDEX idx_lubricant_checklists_checklist ON public.lubricant_checklists(checklist_id);
ALTER TABLE public.lubricant_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lubricant checklists in their company"
  ON public.lubricant_checklists FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Pro users can manage lubricant checklists"
  ON public.lubricant_checklists FOR ALL
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  )
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_feature(company_id, 'lubricant_tracking')
  );

-- Manual receive / adjustment history
CREATE TABLE public.lubricant_stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  lubricant_id UUID NOT NULL REFERENCES public.lubricants(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('receive', 'adjustment')),
  quantity_delta NUMERIC NOT NULL,
  quantity_before NUMERIC NOT NULL,
  quantity_after NUMERIC NOT NULL,
  notes TEXT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lubricant_stock_adj_company ON public.lubricant_stock_adjustments(company_id, created_at DESC);
ALTER TABLE public.lubricant_stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lubricant stock adjustments in their company"
  ON public.lubricant_stock_adjustments FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

-- Usage log (PM / work order consumption)
CREATE TABLE public.lubricant_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  lubricant_id UUID NOT NULL REFERENCES public.lubricants(id) ON DELETE RESTRICT,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  checklist_id UUID REFERENCES public.checklists(id) ON DELETE SET NULL,
  checklist_submission_id UUID REFERENCES public.checklist_submissions(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_by UUID DEFAULT auth.uid(),
  notes TEXT
);

CREATE INDEX idx_lubricant_usage_company ON public.lubricant_usage_logs(company_id, used_at DESC);
CREATE INDEX idx_lubricant_usage_lubricant ON public.lubricant_usage_logs(lubricant_id, used_at DESC);
CREATE INDEX idx_lubricant_usage_asset ON public.lubricant_usage_logs(asset_id, used_at DESC);
ALTER TABLE public.lubricant_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lubricant usage in their company"
  ON public.lubricant_usage_logs FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

-- Extend tier gate
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
    ELSE false
  END;
END;
$$;

-- Receive stock or manual adjustment (records history + updates on-hand qty)
CREATE OR REPLACE FUNCTION public.adjust_lubricant_stock(
  _lubricant_id uuid,
  _adjustment_type text,
  _quantity_delta numeric,
  _notes text DEFAULT NULL
)
RETURNS public.lubricant_stock_adjustments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _before numeric;
  _after numeric;
  _row public.lubricant_stock_adjustments%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF _adjustment_type NOT IN ('receive', 'adjustment') THEN
    RAISE EXCEPTION 'adjustment_type must be receive or adjustment';
  END IF;

  IF _quantity_delta IS NULL OR _quantity_delta = 0 THEN
    RAISE EXCEPTION 'quantity_delta must be non-zero';
  END IF;

  IF _adjustment_type = 'receive' AND _quantity_delta < 0 THEN
    RAISE EXCEPTION 'receive adjustments must add stock (positive quantity_delta)';
  END IF;

  SELECT l.company_id, l.quantity_on_hand
  INTO _company_id, _before
  FROM public.lubricants AS l
  WHERE l.id = _lubricant_id
    AND l.company_id = public.get_user_company(_uid)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Lubricant not found';
  END IF;

  IF NOT public.has_feature(_company_id, 'lubricant_tracking') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Lubricant tracking requires a Pro or Business plan';
  END IF;

  _after := _before + _quantity_delta;
  IF _after < 0 THEN
    RAISE EXCEPTION 'Stock cannot go below zero (current: %, delta: %)', _before, _quantity_delta;
  END IF;

  UPDATE public.lubricants
  SET quantity_on_hand = _after
  WHERE id = _lubricant_id;

  INSERT INTO public.lubricant_stock_adjustments (
    company_id, lubricant_id, adjustment_type, quantity_delta,
    quantity_before, quantity_after, notes, created_by
  )
  VALUES (
    _company_id, _lubricant_id, _adjustment_type, _quantity_delta,
    _before, _after, NULLIF(_notes, ''), _uid
  )
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_lubricant_stock(uuid, text, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_lubricant_stock(uuid, text, numeric, text) TO authenticated;

-- Record PM / work-order lubricant consumption and decrement inventory
CREATE OR REPLACE FUNCTION public.record_lubricant_usage(
  _lines jsonb,
  _checklist_id uuid DEFAULT NULL,
  _checklist_submission_id uuid DEFAULT NULL,
  _work_order_id uuid DEFAULT NULL,
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
  IF _uid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authenticated';
  END IF;

  IF jsonb_typeof(_lines) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'lines must be a JSON array';
  END IF;

  _company_id := public.get_user_company(_uid);
  IF _company_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'No company';
  END IF;

  IF NOT public.has_feature(_company_id, 'lubricant_tracking') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Lubricant tracking requires a Pro or Business plan';
  END IF;

  IF _checklist_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.checklists c
      WHERE c.id = _checklist_id AND c.company_id = _company_id
    ) THEN
      RAISE EXCEPTION 'Checklist not found in company';
    END IF;
  END IF;

  IF _work_order_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.work_orders wo
      WHERE wo.id = _work_order_id AND wo.company_id = _company_id
    ) THEN
      RAISE EXCEPTION 'Work order not found in company';
    END IF;
  END IF;

  FOR _line IN
    SELECT *
    FROM jsonb_to_recordset(_lines) AS x(
      lubricant_id uuid,
      asset_id uuid,
      quantity numeric
    )
  LOOP
    IF _line.quantity IS NULL OR _line.quantity <= 0 THEN
      CONTINUE;
    END IF;

    SELECT l.quantity_on_hand
    INTO _before
    FROM public.lubricants AS l
    WHERE l.id = _line.lubricant_id
      AND l.company_id = _company_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Lubricant % not found', _line.lubricant_id;
    END IF;

    IF _checklist_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.lubricant_checklists lc
      WHERE lc.lubricant_id = _line.lubricant_id
        AND lc.checklist_id = _checklist_id
    ) THEN
      RAISE EXCEPTION 'Lubricant is not linked to this PM checklist';
    END IF;

    IF _line.asset_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = _line.asset_id AND a.company_id = _company_id
    ) THEN
      RAISE EXCEPTION 'Asset not found in company';
    END IF;

    _after := _before - _line.quantity;
    IF _after < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for lubricant % (on hand: %, requested: %)',
        _line.lubricant_id, _before, _line.quantity;
    END IF;

    UPDATE public.lubricants
    SET quantity_on_hand = _after
    WHERE id = _line.lubricant_id;

    INSERT INTO public.lubricant_usage_logs (
      company_id, lubricant_id, asset_id, checklist_id,
      checklist_submission_id, work_order_id, quantity, used_by, notes
    )
    VALUES (
      _company_id, _line.lubricant_id, _line.asset_id, _checklist_id,
      _checklist_submission_id, _work_order_id, _line.quantity, _uid,
      NULLIF(_notes, '')
    );

    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_lubricant_usage(jsonb, uuid, uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_lubricant_usage(jsonb, uuid, uuid, uuid, text) TO authenticated;
