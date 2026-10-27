import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { format } from "date-fns";
import { Plus, ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QueryErrorState from "@/components/common/QueryErrorState";
import { usePurchasing } from "@/hooks/usePurchasing";
import { useParts } from "@/hooks/useParts";
import type { PurchaseOrder, PurchaseOrderLine } from "@/types/purchasing";

type DraftLine = {
  part_id: string;
  description: string;
  quantity: string;
  unit_cost: string;
};

export function PurchasingDashboard() {
  const { requests, orders, isLoading, error, refetch, createRequest, createOrder, receiveLine, setTaxRate } =
    usePurchasing();
  const { parts } = useParts();

  const [reqOpen, setReqOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [poOpen, setPoOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [taxRate, setTaxRateLocal] = useState("0");
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { part_id: "", description: "", quantity: "1", unit_cost: "0" },
  ]);
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [receiveQty, setReceiveQty] = useState<Record<string, string>>({});

  const selectedPo = useMemo(
    () => orders.find((o) => o.id === selectedPoId) ?? null,
    [orders, selectedPoId],
  );

  if (error) {
    return <QueryErrorState title="Could not load purchasing." onRetry={() => refetch()} />;
  }

  const submitRequest = async () => {
    if (!reqTitle.trim()) return;
    await createRequest.mutateAsync({ title: reqTitle.trim() });
    setReqTitle("");
    setReqOpen(false);
  };

  const submitPo = async () => {
    if (!vendor.trim()) return;
    const lines = draftLines
      .filter((l) => l.description.trim() && Number(l.quantity) > 0)
      .map((l) => ({
        part_id: l.part_id || null,
        description: l.description.trim(),
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost) || 0,
      }));
    if (!lines.length) return;
    await createOrder.mutateAsync({
      vendor_name: vendor.trim(),
      tax_rate_percent: Number(taxRate) || 0,
      lines,
    });
    setPoOpen(false);
    setVendor("");
    setTaxRateLocal("0");
    setDraftLines([{ part_id: "", description: "", quantity: "1", unit_cost: "0" }]);
  };

  const onPartPick = (index: number, partId: string) => {
    const part = parts.find((p) => p.id === partId);
    setDraftLines((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              part_id: partId,
              description: part?.name ?? row.description,
            }
          : row,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Purchase orders</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setReqOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> New request
            </Button>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="p-6 text-muted-foreground">Loading…</td></tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      No purchase requests yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3 font-medium">{r.title}</td>
                      <td className="p-3"><Badge variant="outline">{r.status}</Badge></td>
                      <td className="p-3 text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setPoOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> New PO
            </Button>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={3} className="p-6 text-muted-foreground">Loading…</td></tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        Create a PO to track tax, lines, and receiving into parts inventory.
                      </td>
                    </tr>
                  ) : (
                    orders.map((po) => (
                      <tr
                        key={po.id}
                        className={`border-b cursor-pointer hover:bg-muted/30 ${selectedPoId === po.id ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedPoId(po.id)}
                      >
                        <td className="p-3 font-medium">{po.vendor_name}</td>
                        <td className="p-3">
                          ${po.total.toFixed(2)}
                          <span className="block text-xs text-muted-foreground">
                            Tax ${po.tax_amount.toFixed(2)} @ {po.tax_rate_percent}%
                          </span>
                        </td>
                        <td className="p-3"><Badge variant="outline">{po.status}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>

            <Card className="p-4">
              {!selectedPo ? (
                <p className="text-sm text-muted-foreground">Select a purchase order to view lines and receive stock.</p>
              ) : (
                <PoDetail
                  po={selectedPo}
                  receiveQty={receiveQty}
                  setReceiveQty={setReceiveQty}
                  onReceive={(lineId, qty) => receiveLine.mutateAsync({ lineId, qty })}
                  onTaxChange={(rate) => setTaxRate.mutateAsync({ poId: selectedPo.id, rate })}
                  receiving={receiveLine.isPending}
                />
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New purchase request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} placeholder="e.g. HVAC filters Q4" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
            <Button onClick={submitRequest} disabled={createRequest.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New purchase order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tax rate (%)</Label>
              <Input type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRateLocal(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label>Lines</Label>
              {draftLines.map((line, i) => (
                <div key={i} className="grid gap-2 border rounded-md p-3">
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={line.part_id}
                    onChange={(e) => onPartPick(i, e.target.value)}
                  >
                    <option value="">Link part (optional)</option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) =>
                      setDraftLines((prev) => prev.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) =>
                        setDraftLines((prev) => prev.map((r, j) => (j === i ? { ...r, quantity: e.target.value } : r)))
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Unit cost"
                      value={line.unit_cost}
                      onChange={(e) =>
                        setDraftLines((prev) => prev.map((r, j) => (j === i ? { ...r, unit_cost: e.target.value } : r)))
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDraftLines((prev) => [...prev, { part_id: "", description: "", quantity: "1", unit_cost: "0" }])
                }
              >
                Add line
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPoOpen(false)}>Cancel</Button>
            <Button onClick={submitPo} disabled={createOrder.isPending}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PoDetail({
  po,
  receiveQty,
  setReceiveQty,
  onReceive,
  onTaxChange,
  receiving,
}: {
  po: PurchaseOrder;
  receiveQty: Record<string, string>;
  setReceiveQty: Dispatch<SetStateAction<Record<string, string>>>;
  onReceive: (lineId: string, qty: number) => Promise<unknown>;
  onTaxChange: (rate: number) => Promise<unknown>;
  receiving: boolean;
}) {
  const [taxEdit, setTaxEdit] = useState(String(po.tax_rate_percent));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{po.vendor_name}</h3>
        <p className="text-xs text-muted-foreground">{format(new Date(po.created_at), "PPpp")}</p>
        <p className="text-sm mt-2">
          Subtotal ${po.subtotal.toFixed(2)} · Tax ${po.tax_amount.toFixed(2)} ·{" "}
          <span className="font-semibold">Total ${po.total.toFixed(2)}</span>
        </p>
        <div className="flex items-end gap-2 mt-2">
          <div className="flex-1">
            <Label className="text-xs">Tax rate %</Label>
            <Input type="number" value={taxEdit} onChange={(e) => setTaxEdit(e.target.value)} className="h-8" />
          </div>
          <Button size="sm" variant="secondary" onClick={() => onTaxChange(Number(taxEdit) || 0)}>
            Update tax
          </Button>
        </div>
      </div>
      <ul className="space-y-3">
        {(po.lines ?? []).map((line: PurchaseOrderLine) => {
          const remaining = line.quantity - line.qty_received;
          const qtyStr = receiveQty[line.id] ?? String(remaining > 0 ? remaining : "");
          return (
            <li key={line.id} className="border rounded-md p-3 text-sm">
              <p className="font-medium">{line.description}</p>
              <p className="text-xs text-muted-foreground">
                Ordered {line.quantity} @ ${line.unit_cost.toFixed(2)} · Received {line.qty_received}
                {line.part?.name ? ` · Part: ${line.part.name}` : ""}
              </p>
              {remaining > 0 && (
                <div className="flex gap-2 mt-2 items-center">
                  <Input
                    className="h-8 w-24"
                    type="number"
                    min={0}
                    max={remaining}
                    value={qtyStr}
                    onChange={(e) => setReceiveQty((prev) => ({ ...prev, [line.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    disabled={receiving}
                    onClick={() => {
                      const q = Number(qtyStr);
                      if (q > 0 && q <= remaining) onReceive(line.id, q);
                    }}
                  >
                    <Truck className="h-3.5 w-3.5 mr-1" /> Receive
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
