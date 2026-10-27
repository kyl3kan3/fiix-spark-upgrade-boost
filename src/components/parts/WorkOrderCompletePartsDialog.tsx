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
import { fetchLubricants, fetchLubricantsForAsset, recordLubricantUsage } from "@/services/lubricantService";
import type { LubricantUsageLine } from "@/types/lubricants";
import { useHasFeature } from "@/hooks/useSubscription";
import { useMaintenanceCodes } from "@/hooks/useMaintenanceCodes";
import { saveWorkOrderCompletionCodes } from "@/services/maintenanceCodesService";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  workOrderTitle?: string;
  assetId?: string | null;
  onCompleted: () => void;
}

export function WorkOrderCompletePartsDialog({
  open,
  onOpenChange,
  workOrderId,
  workOrderTitle,
  assetId,
  onCompleted,
}: Props) {
  const partsEnabled = useHasFeature("parts_inventory");
  const lubricantsEnabled = useHasFeature("lubricant_tracking");
  const codesEnabled = useHasFeature("failure_downtime_codes");
  const enabled = partsEnabled || lubricantsEnabled || codesEnabled;
  const [qty, setQty] = useState<Record<string, string>>({});
  const [lubQty, setLubQty] = useState<Record<string, string>>({});
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

  const { data: allLubricants = [] } = useQuery({
    queryKey: ["lubricants"],
    queryFn: fetchLubricants,
    enabled: open && lubricantsEnabled,
  });

  const { data: assetLubricants = [] } = useQuery({
    queryKey: ["lubricants", "asset", assetId],
    queryFn: () => fetchLubricantsForAsset(assetId!),
    enabled: open && lubricantsEnabled && !!assetId,
  });

  const lubricants =
    assetId && assetLubricants.length > 0 ? assetLubricants : allLubricants;

  useEffect(() => {
    if (!open) {
      setQty({});
      setLubQty({});
      setFailureCodeId("");
      setDowntimeCodeId("");
      setDowntimeMinutes("");
    }
  }, [open]);

  const lines: PartUsageLine[] = parts
    .map((p) => ({ part_id: p.id, quantity: Number(qty[p.id]) || 0 }))
    .filter((l) => l.quantity > 0);

  const lubLines: LubricantUsageLine[] = lubricants
    .map((l) => ({
      lubricant_id: l.id,
      asset_id: assetId ?? null,
      quantity: Number(lubQty[l.id]) || 0,
    }))
    .filter((l) => l.quantity > 0);

  const handleConfirm = async (skipUsage: boolean) => {
    setSaving(true);
    try {
      if (partsEnabled && !skipUsage && lines.length > 0) {
        await recordPartUsage(lines, {
          work_order_id: workOrderId,
          asset_id: assetId ?? null,
        });
      }
      if (lubricantsEnabled && !skipUsage && lubLines.length > 0) {
        await recordLubricantUsage(lubLines, {
          work_order_id: workOrderId,
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
          <DialogTitle>
            {workOrderTitle ? `Complete: ${workOrderTitle}` : "Complete work order"}
          </DialogTitle>
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
        {lubricantsEnabled && (
          <div className="space-y-3 max-h-48 overflow-y-auto py-2 border-t">
            <p className="text-sm text-muted-foreground pt-2">
              Optional — lubricant quantities used on this job.
            </p>
            {lubricants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lubricants in catalog yet.</p>
            ) : (
              lubricants.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{l.name}</span>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-8 w-24"
                    placeholder="0"
                    value={lubQty[l.id] ?? ""}
                    onChange={(e) => setLubQty((prev) => ({ ...prev, [l.id]: e.target.value }))}
                  />
                </div>
              ))
            )}
          </div>
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
          {(partsEnabled || lubricantsEnabled) && (
            <Button variant="outline" disabled={saving} onClick={() => handleConfirm(true)}>
              Skip usage
            </Button>
          )}
          <Button
            disabled={saving}
            onClick={() => handleConfirm(!(partsEnabled || lubricantsEnabled))}
          >
            {saving ? "Saving…" : "Complete job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
