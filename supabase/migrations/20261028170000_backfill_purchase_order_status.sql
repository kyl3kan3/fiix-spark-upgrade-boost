-- Recompute PO status for existing orders after sync_purchase_order_status was introduced.

DO $$
DECLARE
  _po_id uuid;
BEGIN
  FOR _po_id IN SELECT id FROM public.purchase_orders
  LOOP
    PERFORM public.sync_purchase_order_status(_po_id);
  END LOOP;
END;
$$;
