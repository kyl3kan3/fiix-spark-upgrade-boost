import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { createPmWorkOrdersFromPreview, previewPmWorkOrders, type PmWorkOrderPreviewRow } from "@/services/pmBulkService";
import { format } from "date-fns";

export function PmBulkGeneratePanel() {
  const [days, setDays] = useState("30");
  const [rows, setRows] = useState<PmWorkOrderPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const d = Math.min(365, Math.max(1, Number(days) || 30));
      setRows(await previewPmWorkOrders(d));
    } finally {
      setLoading(false);
    }
  };

  const createAll = async () => {
    if (rows.length === 0) return;
    setLoading(true);
    try {
      await createPmWorkOrdersFromPreview(rows);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaywallGate feature="bulk_pm_generation" title="Bulk PM work orders" description="Upgrade to preview and generate work orders from PM schedules in one batch.">
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div>
            <Label>Horizon (days)</Label>
            <Input className="w-28" type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <Button onClick={loadPreview} disabled={loading}>Preview dates</Button>
          <Button variant="default" onClick={createAll} disabled={loading || rows.length === 0}>
            Create {rows.length} work orders
          </Button>
        </div>
        {rows.length > 0 && (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="p-2">PM checklist</th>
                  <th className="p-2">Due</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map((r, i) => (
                  <tr key={`${r.checklist_id}-${r.due_at}-${i}`} className="border-b border-border/40">
                    <td className="p-2">{r.checklist_name}</td>
                    <td className="p-2">{format(new Date(r.due_at), "MMM d, yyyy HH:mm")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 200 && <p className="text-xs text-muted-foreground mt-2">Showing first 200 of {rows.length}.</p>}
          </div>
        )}
      </Card>
    </PaywallGate>
  );
}
