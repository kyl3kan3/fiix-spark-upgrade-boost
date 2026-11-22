import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchParts, fetchPartsForAsset } from "@/services/partsService";
import type { PartUsageLine } from "@/types/parts";
import { fetchLubricants, fetchLubricantsForAsset } from "@/services/lubricantService";
import type { LubricantUsageLine } from "@/types/lubricants";
import { useHasFeature } from "@/hooks/useSubscription";
import { useMaintenanceCodes } from "@/hooks/useMaintenanceCodes";
import { completeWorkOrderWithUsage } from "@/services/workOrderService";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { scanPart, type ScannedPart } from "@/services/scanService";
import { ScanLine } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  workOrderTitle?: string;
  assetId?: string | null;
  onCompleted?: () => void;
  queueOfflineCompletion?: () => void;
}

export function WorkOrderCompletePartsDialog({
  open,
  onOpenChange,
  workOrderId,
  workOrderTitle,
  assetId,
  onCompleted,
  queueOfflineCompletion,
}: Props) {
  const queryClient = useQueryClient();
  const partsEnabled = useHasFeature("parts_inventory");
  const lubricantsEnabled = useHasFeature("lubricant_tracking");
  const codesEnabled = useHasFeature("failure_downtime_codes");
  const enabled = partsEnabled || lubricantsEnabled || codesEnabled;
  const [qty, setQty] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
  const [lubQty, setLubQty] = useState<Record<string, string>>({});
  const [failureCodeId, setFailureCodeId] = useState("");
  const [downtimeCodeId, setDowntimeCodeId] = useState("");
  const [downtimeMinutes, setDowntimeMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  const suggestedParts = assetId && assetParts.length > 0 ? assetParts : allParts;
  const scannedIds = new Set(scannedParts.map((part) => part.id));
  const parts = [...scannedParts, ...suggestedParts.filter((part) => !scannedIds.has(part.id))];

  const addScannedPart = async (value: string, signal: AbortSignal) => {
    const part = await scanPart(value);
    if (signal.aborted) return;
    setScannedParts((previous) => [part, ...previous.filter((row) => row.id !== part.id)]);
    setQty((previous) => ({
      ...previous,
      [part.id]: String(Math.max(0, Number(previous[part.id]) || 0) + 1),
    }));
    setScanning(false);
  };

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
      setScanning(false);
      setScannedParts([]);
      setLubQty({});
      setFailureCodeId("");
      setDowntimeCodeId("");
      setDowntimeMinutes("");
      setSaveError("");
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
    setSaveError("");
    try {
      const partsUsed = partsEnabled && !skipUsage ? lines : [];
      const lubricantsUsed = lubricantsEnabled && !skipUsage ? lubLines : [];
      if (!navigator.onLine && queueOfflineCompletion) {
        if (partsUsed.length || lubricantsUsed.length || failureCodeId || downtimeCodeId || downtimeMinutes) {
          throw new Error("Reconnect to save inventory usage or downtime details with this job.");
        }
        queueOfflineCompletion();
      } else {
        const completed = await completeWorkOrderWithUsage(workOrderId, {
          parts: partsUsed,
          lubricants: lubricantsUsed,
          failureCodeId: codesEnabled && failureCodeId || undefined,
          downtimeCodeId: codesEnabled && downtimeCodeId || undefined,
          downtimeMinutes: codesEnabled && downtimeMinutes ? Number(downtimeMinutes) : undefined,
        });
        if (completed) toast.success("Work order completed");
        else toast.message("This work order was already complete. Stock was not deducted again.");
        for (const key of [["workOrder", workOrderId], ["workOrders"], ["parts"], ["lubricants"], ["maintenance-codes", "mttr"]]) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
        onCompleted?.();
      }
      onOpenChange(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not complete the work order. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!enabled) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!saving) onOpenChange(nextOpen); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workOrderTitle ? `Complete: ${workOrderTitle}` : "Complete work order"}
          </DialogTitle>
          {partsEnabled && <DialogDescription>Scan a part to add one unit, or enter the quantity used.</DialogDescription>}
        </DialogHeader>
        {partsEnabled && (
          <>
            <Button type="button" variant="outline" className="justify-self-start" disabled={saving}
              onClick={() => setScanning((previous) => !previous)}>
              <ScanLine className="mr-2 h-4 w-4" />
              {scanning ? "Cancel scan" : "Scan a part"}
            </Button>
            {scanning && <BarcodeScanner onScan={addScannedPart} />}
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
                      aria-label={`Quantity used for ${p.name}`}
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
        {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          {(partsEnabled || lubricantsEnabled) && (
            <Button variant="outline" disabled={saving || scanning} onClick={() => handleConfirm(true)}>
              Skip usage
            </Button>
          )}
          <Button
            disabled={saving || scanning}
            onClick={() => handleConfirm(!(partsEnabled || lubricantsEnabled))}
          >
            {saving ? "Saving…" : "Complete job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
