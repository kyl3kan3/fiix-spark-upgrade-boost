import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Pencil, Plus } from "lucide-react";
import { DeleteConfirmButton } from "@/components/common/DeleteConfirmButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParts, usePartAdjustments } from "@/hooks/useParts";
import { PartFormDialog } from "./PartFormDialog";
import { PartStockAdjustDialog } from "./PartStockAdjustDialog";
import { isLowStock } from "@/lib/partsAnalytics";
import type { PartWithLinks } from "@/types/parts";
import { format } from "date-fns";
import QueryErrorState from "@/components/common/QueryErrorState";

export function PartsDashboard() {
  const {
    parts,
    isLoading,
    error,
    refetch,
    consumptionByPart,
    consumptionByAsset,
    usageLogs,
    create,
    update,
    remove,
    adjustStock,
  } = useParts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PartWithLinks | null>(null);
  const [stockPart, setStockPart] = useState<PartWithLinks | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => parts.find((p) => p.id === selectedId) ?? null,
    [parts, selectedId],
  );

  const { data: adjustments = [] } = usePartAdjustments(selected?.id);

  const lowCount = parts.filter((p) => isLowStock(p.quantity_on_hand, p.min_quantity)).length;

  if (error) {
    return <QueryErrorState title="Could not load parts." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {lowCount > 0 && (
        <Card className="p-4 border-warning/40 bg-warning/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              {lowCount} part{lowCount > 1 ? "s" : ""} at or below minimum quantity
            </p>
            <p className="text-xs text-muted-foreground mt-1">Receive stock or adjust quantities from each row.</p>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add part
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Part #</th>
                <th className="p-3 font-semibold">On hand</th>
                <th className="p-3 font-semibold">Equipment</th>
                <th className="p-3 font-semibold w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-6 text-muted-foreground">Loading…</td></tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Boxes className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No parts yet. Add your catalog to track shelf stock and work-order consumption.
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const low = isLowStock(part.quantity_on_hand, part.min_quantity);
                  const assets = part.part_assets ?? [];
                  return (
                    <tr
                      key={part.id}
                      className={`border-b hover:bg-muted/30 cursor-pointer ${selectedId === part.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedId(part.id)}
                    >
                      <td className="p-3 font-medium">
                        {part.name}
                        {low && (
                          <Badge variant="outline" className="ml-2 text-[10px] border-warning/50 text-warning">Low</Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{part.part_number || "—"}</td>
                      <td className="p-3">
                        {part.quantity_on_hand} {part.unit_of_measure}
                        <span className="text-xs text-muted-foreground block">Min @ {part.min_quantity}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {assets.map((a) => a.asset?.name).filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="p-3 sticky right-0 bg-card shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end min-w-[108px]">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(part); setFormOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setStockPart(part)}>
                            <Boxes className="h-3.5 w-3.5" />
                          </Button>
                          <DeleteConfirmButton
                            itemLabel={part.name}
                            onConfirm={() => remove.mutate(part.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Stock history — {selected.name}</h3>
            {adjustments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No adjustments yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {adjustments.map((a) => (
                  <li key={a.id} className="flex justify-between border-b border-border/50 pb-2">
                    <span>
                      <span className="capitalize">{a.adjustment_type}</span>
                      {a.quantity_delta > 0 ? ` +${a.quantity_delta}` : ` ${a.quantity_delta}`}
                      {a.notes && <span className="text-muted-foreground"> — {a.notes}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Recent usage — {selected.name}</h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {usageLogs.filter((u) => u.part_id === selected.id).slice(0, 15).map((u) => (
                <li key={u.id} className="flex justify-between border-b border-border/50 pb-2">
                  <span>
                    {u.quantity} {selected.unit_of_measure}
                    {u.asset?.name && ` · ${u.asset.name}`}
                  </span>
                  <span className="text-xs text-muted-foreground">{format(new Date(u.used_at), "MMM d")}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Consumption by part (180 days)</h3>
          {consumptionByPart.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {consumptionByPart.slice(0, 10).map((row) => (
                <li key={row.key} className="flex justify-between">
                  <span>{row.label}</span>
                  <span className="font-medium">{row.totalQuantity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Consumption by equipment (180 days)</h3>
          {consumptionByAsset.length === 0 ? (
            <p className="text-sm text-muted-foreground">No asset-tagged usage yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {consumptionByAsset.slice(0, 10).map((row) => (
                <li key={row.key} className="flex justify-between">
                  <span>{row.label}</span>
                  <span className="font-medium">{row.totalQuantity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <PartFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        isPending={create.isPending || update.isPending}
        onSubmit={async (payload) => {
          if (editing) {
            await update.mutateAsync({ id: editing.id, ...payload });
          } else {
            await create.mutateAsync(payload);
          }
        }}
      />

      <PartStockAdjustDialog
        part={stockPart}
        open={!!stockPart}
        onOpenChange={(o) => !o && setStockPart(null)}
        isPending={adjustStock.isPending}
        onAdjust={async (args) => {
          if (!stockPart) return;
          await adjustStock.mutateAsync({
            partId: stockPart.id,
            type: args.type,
            delta: args.delta,
            notes: args.notes,
          });
        }}
      />
    </div>
  );
}
