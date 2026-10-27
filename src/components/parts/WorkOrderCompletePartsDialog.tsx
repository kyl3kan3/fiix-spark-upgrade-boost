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
  const enabled = useHasFeature("parts_inventory");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: allParts = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: fetchParts,
    enabled: open && enabled,
  });

  const { data: assetParts = [] } = useQuery({
    queryKey: ["parts", "asset", assetId],
    queryFn: () => fetchPartsForAsset(assetId!),
    enabled: open && enabled && !!assetId,
  });

  const parts = assetId && assetParts.length > 0 ? assetParts : allParts;

  useEffect(() => {
    if (!open) setQty({});
  }, [open]);

  const lines: PartUsageLine[] = parts
    .map((p) => ({ part_id: p.id, quantity: Number(qty[p.id]) || 0 }))
    .filter((l) => l.quantity > 0);

  const handleConfirm = async (skipParts: boolean) => {
    setSaving(true);
    try {
      if (!skipParts && lines.length > 0) {
        await recordPartUsage(lines, {
          work_order_id: workOrderId,
          asset_id: assetId ?? null,
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
          <DialogTitle>Parts used on this job?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Optional — enter quantities consumed from stock before marking complete.
        </p>
        <div className="space-y-3 max-h-64 overflow-y-auto py-2">
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
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" disabled={saving} onClick={() => handleConfirm(true)}>
            Skip
          </Button>
          <Button disabled={saving} onClick={() => handleConfirm(false)}>
            {saving ? "Saving…" : "Complete job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
