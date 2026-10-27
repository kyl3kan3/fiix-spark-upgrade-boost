import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchLubricantsForChecklist } from "@/services/lubricantService";
import { isLowStock } from "@/lib/lubricantAnalytics";
import type { LubricantUsageLine } from "@/types/lubricants";
import { useHasFeature } from "@/hooks/useSubscription";
import { Droplets } from "lucide-react";

interface Props {
  checklistId: string;
  /** assetId -> lubricantId -> quantity string */
  assetIds?: string[];
  value: LubricantUsageLine[];
  onChange: (lines: LubricantUsageLine[]) => void;
}

/**
 * PM completion: enter quantity consumed per linked lubricant (per asset when multi-asset).
 */
export function LubricantConsumptionSection({ checklistId, assetIds, value, onChange }: Props) {
  const enabled = useHasFeature("lubricant_tracking");
  const { data: lubricants = [] } = useQuery({
    queryKey: ["lubricants", "checklist", checklistId],
    queryFn: () => fetchLubricantsForChecklist(checklistId),
    enabled: enabled && !!checklistId,
  });

  const targets = assetIds && assetIds.length > 0 ? assetIds : [null as string | null];

  useEffect(() => {
    if (!enabled || lubricants.length === 0) {
      onChange([]);
    }
  }, [enabled, lubricants.length, onChange]);

  if (!enabled || lubricants.length === 0) return null;

  const setQty = (lubricantId: string, assetId: string | null, qty: string) => {
    const num = qty === "" ? 0 : Number(qty);
    const rest = value.filter(
      (l) => !(l.lubricant_id === lubricantId && (l.asset_id ?? null) === assetId),
    );
    if (num > 0) {
      onChange([...rest, { lubricant_id: lubricantId, asset_id: assetId, quantity: num }]);
    } else {
      onChange(rest);
    }
  };

  const getQty = (lubricantId: string, assetId: string | null) => {
    const found = value.find(
      (l) => l.lubricant_id === lubricantId && (l.asset_id ?? null) === assetId,
    );
    return found?.quantity ? String(found.quantity) : "";
  };

  return (
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Lubricant used</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Enter quantity consumed for each linked lubricant. On-hand inventory updates when you submit.
      </p>
      <div className="space-y-4">
        {lubricants.map((lub) => (
          <div key={lub.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{lub.name}</span>
              {isLowStock(lub.quantity_on_hand, lub.reorder_level) && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
                  Low stock ({lub.quantity_on_hand} {lub.unit_of_measure})
                </span>
              )}
            </div>
            {targets.map((assetId) => (
              <div key={assetId ?? "single"} className="flex items-center gap-3">
                {assetId && (
                  <Label className="text-xs text-muted-foreground w-24 shrink-0 truncate">Asset</Label>
                )}
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-8 max-w-[140px]"
                    placeholder={`0 ${lub.unit_of_measure}`}
                    value={getQty(lub.id, assetId)}
                    onChange={(e) => setQty(lub.id, assetId, e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">{lub.unit_of_measure}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
