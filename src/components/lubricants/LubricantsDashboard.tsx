import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Droplets, Pencil, Plus } from "lucide-react";
import { DeleteConfirmButton } from "@/components/common/DeleteConfirmButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLubricants, useLubricantAdjustments } from "@/hooks/useLubricants";
import { LubricantFormDialog } from "./LubricantFormDialog";
import { StockAdjustDialog } from "./StockAdjustDialog";
import { isLowStock } from "@/lib/lubricantAnalytics";
import type { LubricantWithLinks } from "@/types/lubricants";
import { format } from "date-fns";
import QueryErrorState from "@/components/common/QueryErrorState";

export function LubricantsDashboard() {
  const {
    lubricants,
    isLoading,
    error,
    refetch,
    consumptionByLubricant,
    consumptionByAsset,
    usageLogs,
    create,
    update,
    remove,
    adjustStock,
  } = useLubricants();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LubricantWithLinks | null>(null);
  const [stockLub, setStockLub] = useState<LubricantWithLinks | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => lubricants.find((l) => l.id === selectedId) ?? null,
    [lubricants, selectedId],
  );

  const { data: adjustments = [] } = useLubricantAdjustments(selected?.id);

  const lowCount = lubricants.filter((l) => isLowStock(l.quantity_on_hand, l.reorder_level)).length;

  if (error) {
    return <QueryErrorState title="Could not load lubricants." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {lowCount > 0 && (
        <Card className="p-4 border-warning/40 bg-warning/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">{lowCount} lubricant{lowCount > 1 ? "s" : ""} at or below reorder level</p>
            <p className="text-xs text-muted-foreground mt-1">Receive stock or adjust quantities from each row.</p>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add lubricant
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">On hand</th>
                <th className="p-3 font-semibold">Equipment</th>
                <th className="p-3 font-semibold">PMs</th>
                <th className="p-3 font-semibold w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-6 text-muted-foreground">Loading…</td></tr>
              ) : lubricants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Droplets className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No lubricants yet. Add your catalog to track shelf stock and PM consumption.
                  </td>
                </tr>
              ) : (
                lubricants.map((lub) => {
                  const low = isLowStock(lub.quantity_on_hand, lub.reorder_level);
                  const assets = lub.lubricant_assets ?? [];
                  const pms = lub.lubricant_checklists ?? [];
                  return (
                    <tr
                      key={lub.id}
                      className={`border-b hover:bg-muted/30 cursor-pointer ${selectedId === lub.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedId(lub.id)}
                    >
                      <td className="p-3 font-medium">
                        {lub.name}
                        {low && (
                          <Badge variant="outline" className="ml-2 text-[10px] border-warning/50 text-warning">Low</Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{lub.lubricant_type || "—"}</td>
                      <td className="p-3">
                        {lub.quantity_on_hand} {lub.unit_of_measure}
                        <span className="text-xs text-muted-foreground block">Reorder @ {lub.reorder_level}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[160px] truncate">
                        {assets.map((a) => a.asset?.name).filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[160px] truncate">
                        {pms.map((c) => c.checklist?.name).filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(lub); setFormOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setStockLub(lub)}>
                            <Droplets className="h-3.5 w-3.5" />
                          </Button>
                          <DeleteConfirmButton
                            itemLabel={lub.name}
                            onConfirm={() => remove.mutate(lub.id)}
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
              {usageLogs.filter((u) => u.lubricant_id === selected.id).slice(0, 15).map((u) => (
                <li key={u.id} className="flex justify-between border-b border-border/50 pb-2">
                  <span>
                    {u.quantity} {selected.unit_of_measure}
                    {u.asset?.name && ` · ${u.asset.name}`}
                    {u.checklist?.name && (
                      <>
                        {" · "}
                        <Link className="text-primary hover:underline" to={`/checklists/${u.checklist_id}`}>
                          {u.checklist.name}
                        </Link>
                      </>
                    )}
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
          <h3 className="font-semibold mb-3">Consumption by lubricant (180 days)</h3>
          {consumptionByLubricant.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {consumptionByLubricant.slice(0, 10).map((row) => (
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

      <LubricantFormDialog
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

      <StockAdjustDialog
        lubricant={stockLub}
        open={!!stockLub}
        onOpenChange={(o) => !o && setStockLub(null)}
        isPending={adjustStock.isPending}
        onAdjust={async (args) => {
          if (!stockLub) return;
          await adjustStock.mutateAsync({
            lubricantId: stockLub.id,
            type: args.type,
            delta: args.delta,
            notes: args.notes,
          });
        }}
      />
    </div>
  );
}
