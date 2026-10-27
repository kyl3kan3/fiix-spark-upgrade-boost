-- Link POs to vendors and refresh PO status after receiving.

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.sync_purchase_order_status(_po_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _open_lines int;
  _partial_lines int;
  _received_lines int;
BEGIN
  SELECT
    count(*) FILTER (WHERE qty_received = 0),
    count(*) FILTER (WHERE qty_received > 0 AND qty_received < quantity),
    count(*) FILTER (WHERE qty_received >= quantity)
  INTO _open_lines, _partial_lines, _received_lines
  FROM public.purchase_order_lines
  WHERE purchase_order_id = _po_id;

  UPDATE public.purchase_orders
  SET status = CASE
    WHEN _received_lines > 0 AND _open_lines = 0 AND _partial_lines = 0 THEN 'received'
    WHEN _partial_lines > 0 OR (_received_lines > 0 AND _open_lines > 0) THEN 'partial'
    ELSE 'open'
  END
  WHERE id = _po_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.receive_purchase_order_line(_line_id uuid, _qty numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _company_id uuid;
  _line record;
  _po_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'qty must be positive'; END IF;
  SELECT l.*, po.company_id AS po_company, po.id AS po_id
  INTO _line
  FROM public.purchase_order_lines l
  JOIN public.purchase_orders po ON po.id = l.purchase_order_id
  WHERE l.id = _line_id AND po.company_id = public.get_user_company(_uid)
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Line not found'; END IF;
  _company_id := _line.po_company;
  _po_id := _line.po_id;
  IF NOT public.has_feature(_company_id, 'purchasing') THEN RAISE EXCEPTION 'Purchasing not enabled'; END IF;
  IF _line.qty_received + _qty > _line.quantity THEN RAISE EXCEPTION 'Cannot receive more than ordered'; END IF;
  UPDATE public.purchase_order_lines SET qty_received = qty_received + _qty WHERE id = _line_id;
  IF _line.part_id IS NOT NULL THEN
    PERFORM public.adjust_part_stock(_line.part_id, 'receive', _qty, 'PO receipt');
  END IF;
  PERFORM public.sync_purchase_order_status(_po_id);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_purchase_order_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_purchase_order_status(uuid) TO authenticated;
