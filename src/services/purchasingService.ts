import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";
import { toast } from "sonner";
import type {
  CreatePurchaseOrderInput,
  CreatePurchaseRequestInput,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseRequest,
} from "@/types/purchasing";

const PO_SELECT = `
  *,
  lines:purchase_order_lines(
    *,
    part:parts(id, name, part_number)
  )
`;

export async function fetchPurchaseRequests(): Promise<PurchaseRequest[]> {
  const { data, error } = await supabase
    .from("purchase_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PurchaseRequest[];
}

export async function createPurchaseRequest(input: CreatePurchaseRequestInput): Promise<PurchaseRequest> {
  const { companyId } = await requireUserCompany();
  const { data, error } = await supabase
    .from("purchase_requests")
    .insert([{ ...input, company_id: companyId, status: "draft" }])
    .select()
    .single();
  if (error) throw error;
  toast.success("Purchase request created");
  return data as PurchaseRequest;
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase.from("purchase_orders").select(PO_SELECT).order("created_at", {
    ascending: false,
  });
  if (error) throw error;
  return (data ?? []).map(normalizePo) as PurchaseOrder[];
}

function normalizePo(row: Record<string, unknown>): PurchaseOrder {
  const lines = (row.lines as PurchaseOrderLine[] | undefined) ?? [];
  return {
    ...(row as unknown as PurchaseOrder),
    tax_rate_percent: Number(row.tax_rate_percent),
    subtotal: Number(row.subtotal),
    tax_amount: Number(row.tax_amount),
    total: Number(row.total),
    lines: lines.map((l) => ({
      ...l,
      quantity: Number(l.quantity),
      unit_cost: Number(l.unit_cost),
      qty_received: Number(l.qty_received),
    })),
  };
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
  const { companyId } = await requireUserCompany();
  const { lines, ...header } = input;
  if (!lines.length) throw new Error("Add at least one line");

  const { data: po, error: poErr } = await supabase
    .from("purchase_orders")
    .insert([
      {
        company_id: companyId,
        vendor_name: header.vendor_name,
        vendor_id: header.vendor_id ?? null,
        tax_rate_percent: header.tax_rate_percent ?? 0,
        request_id: header.request_id ?? null,
        status: "open",
      },
    ])
    .select()
    .single();
  if (poErr) throw poErr;

  const { error: lineErr } = await supabase.from("purchase_order_lines").insert(
    lines.map((l) => ({
      company_id: companyId,
      purchase_order_id: po.id,
      part_id: l.part_id ?? null,
      description: l.description,
      quantity: l.quantity,
      unit_cost: l.unit_cost,
    })),
  );
  if (lineErr) throw lineErr;

  await recalculatePurchaseOrderTotals(po.id);
  toast.success("Purchase order created");
  const list = await fetchPurchaseOrders();
  return list.find((p) => p.id === po.id) ?? normalizePo(po);
}

export async function recalculatePurchaseOrderTotals(purchaseOrderId: string): Promise<void> {
  const { error } = await supabase.rpc("recalculate_purchase_order_totals", {
    _po_id: purchaseOrderId,
  });
  if (error) throw error;
}

export async function receivePurchaseOrderLine(lineId: string, qty: number): Promise<void> {
  const { error } = await supabase.rpc("receive_purchase_order_line", {
    _line_id: lineId,
    _qty: qty,
  });
  if (error) throw error;
  toast.success("Received into inventory");
}

export async function updatePurchaseOrderTaxRate(purchaseOrderId: string, taxRatePercent: number): Promise<void> {
  const { error } = await supabase
    .from("purchase_orders")
    .update({ tax_rate_percent: taxRatePercent })
    .eq("id", purchaseOrderId);
  if (error) throw error;
  await recalculatePurchaseOrderTotals(purchaseOrderId);
  toast.success("Tax rate updated");
}
