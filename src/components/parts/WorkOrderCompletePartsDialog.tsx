import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { fetchParts, fetchPartsForAsset, recordPartUsage } from "@/services/partsService";
import type { PartUsageLine } from "@/types/parts";
import { useHasFeature } from "@/hooks/useSubscription";
import { useMaintenanceCodes } from "@/hooks/useMaintenanceCodes";
import { saveWorkOrderCompletionCodes } from "@/services/maintenanceCodesService";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  assetId?: string | null;
  onCompleted: () => void;
}

export function WorkOrderCompletePartsDialog({
  open,
  onOpenChange,
  workOrderId,
  assetId,
  onCompleted,
}: Props) {
  const partsEnabled = useHasFeature("parts_inventory");
  const codesEnabled = useHasFeature("failure_downtime_codes");
  const enabled = partsEnabled || codesEnabled;
  const [qty, setQty] = useState<Record<string, string>>({});
  const [failureCodeId, setFailureCodeId] = useState("");
  const [downtimeCodeId, setDowntimeCodeId] = useState("");
  const [downtimeMinutes, setDowntimeMinutes] = useState("");
  const [saving, setSaving] = useState(false);

  const { codes: failureCodes } = useMaintenanceCodes("failure");
  const { codes: downtimeCodes } = useMaintenanceCodes("downtime");

  const { data: allParts = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: fetchParts,
    enabled: open && partsEnabled,
  });

  const { data: assetParts = [] } = useQuery({
    queryKey: ["parts", "asset", assetId],
    queryFn: () => fetchPartsForAsset(assetId!),
    enabled: open && partsEnabled && !!assetId,
  });

  const parts = assetId && assetParts.length > 0 ? assetParts : allParts;

  useEffect(() => {
    if (!open) {
      setQty({});
      setFailureCodeId("");
      setDowntimeCodeId("");
      setDowntimeMinutes("");
    }
  }, [open]);

  const lines: PartUsageLine[] = parts
    .map((p) => ({ part_id: p.id, quantity: Number(qty[p.id]) || 0 }))
    .filter((l) => l.quantity > 0);

  const handleConfirm = async (skipParts: boolean) => {
    setSaving(true);
    try {
      if (partsEnabled && !skipParts && lines.length > 0) {
        await recordPartUsage(lines, {
          work_order_id: workOrderId,
          asset_id: assetId ?? null,
        });
      }
      if (codesEnabled) {
        await saveWorkOrderCompletionCodes(workOrderId, {
          failure_code_id: failureCodeId || null,
          downtime_code_id: downtimeCodeId || null,
          downtime_minutes: downtimeMinutes ? Number(downtimeMinutes) : null,
        });
      }
      onCompleted();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!enabled) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete work order</DialogTitle>
        </DialogHeader>
        {partsEnabled && (
          <>
            <p className="text-sm text-muted-foreground">
              Optional — enter quantities consumed from stock before marking complete.
            </p>
            <div className="space-y-3 max-h-48 overflow-y-auto py-2">
              {parts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parts in catalog yet.</p>
              ) : (
                parts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      className="h-8 w-24"
                      placeholder="0"
                      value={qty[p.id] ?? ""}
                      onChange={(e) => setQty((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {codesEnabled && (
          <div className="space-y-3 border-t pt-3">
            <div>
              <Label className="text-xs">Failure code</Label>
              <select
                className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                value={failureCodeId}
                onChange={(e) => setFailureCodeId(e.target.value)}
              >
                <option value="">—</option>
                {failureCodes.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Downtime code</Label>
              <select
                className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                value={downtimeCodeId}
                onChange={(e) => setDowntimeCodeId(e.target.value)}
              >
                <option value="">—</option>
                {downtimeCodes.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Downtime (minutes)</Label>
              <Input
                type="number"
                min={0}
                className="h-8 mt-1"
                value={downtimeMinutes}
                onChange={(e) => setDowntimeMinutes(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          {partsEnabled && (
            <Button variant="outline" disabled={saving} onClick={() => handleConfirm(true)}>
              Skip parts
            </Button>
          )}
          <Button disabled={saving} onClick={() => handleConfirm(!partsEnabled)}>
            {saving ? "Saving…" : "Complete job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
