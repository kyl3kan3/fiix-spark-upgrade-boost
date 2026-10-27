export type PurchaseRequestStatus = "draft" | "submitted" | "approved" | "rejected";
export type PurchaseOrderStatus = "open" | "partial" | "received" | "cancelled";

export interface PurchaseRequest {
  id: string;
  company_id: string;
  title: string;
  status: PurchaseRequestStatus;
  notes: string | null;
  requested_by: string | null;
  created_at: string;
}

export interface PurchaseOrderLine {
  id: string;
  company_id: string;
  purchase_order_id: string;
  part_id: string | null;
  description: string;
  quantity: number;
  unit_cost: number;
  qty_received: number;
  part?: { id: string; name: string; part_number: string | null } | null;
}

export interface PurchaseOrder {
  id: string;
  company_id: string;
  request_id: string | null;
  vendor_id: string | null;
  vendor_name: string;
  status: PurchaseOrderStatus;
  tax_rate_percent: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_by: string | null;
  created_at: string;
  lines?: PurchaseOrderLine[];
}

export interface CreatePurchaseOrderInput {
  vendor_name: string;
  vendor_id?: string | null;
  tax_rate_percent?: number;
  request_id?: string | null;
  lines: {
    part_id?: string | null;
    description: string;
    quantity: number;
    unit_cost: number;
  }[];
}

export interface CreatePurchaseRequestInput {
  title: string;
  notes?: string;
}
