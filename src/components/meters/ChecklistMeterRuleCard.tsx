import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHasFeature } from "@/hooks/useSubscription";
import {
  fetchChecklistMeterRule,
  fetchMetersForAsset,
  upsertChecklistMeterRule,
} from "@/services/meterService";

interface Props {
  checklistId: string;
  assetIds: string[];
}

export function ChecklistMeterRuleCard({ checklistId, assetIds }: Props) {
  const enabled = useHasFeature("meter_based_pm");
  const qc = useQueryClient();
  const [meterId, setMeterId] = useState("");
  const [interval, setInterval] = useState("");

  const { data: rule } = useQuery({
    queryKey: ["checklist-meter-rule", checklistId],
    queryFn: () => fetchChecklistMeterRule(checklistId),
    enabled: enabled && !!checklistId,
  });

  const { data: meters = [] } = useQuery({
    queryKey: ["meters-for-checklist", assetIds],
    queryFn: async () => {
      const lists = await Promise.all(assetIds.map((id) => fetchMetersForAsset(id)));
      const byId = new Map<string, (typeof lists)[0][0]>();
      for (const list of lists) {
        for (const m of list) byId.set(m.id, m);
      }
      return [...byId.values()];
    },
    enabled: enabled && assetIds.length > 0,
  });

  useEffect(() => {
    if (rule?.meter_id) setMeterId(rule.meter_id);
    if (rule?.interval_units) setInterval(String(rule.interval_units));
  }, [rule?.meter_id, rule?.interval_units]);

  const meterOptions = useMemo(
    () =>
      meters.map((m) => ({
        id: m.id,
        label: `${m.name} (${m.current_reading} ${m.unit})`,
      })),
    [meters],
  );

  if (!enabled) return null;

  const save = async () => {
    const units = Number(interval);
    if (!meterId || Number.isNaN(units) || units <= 0) return;
    await upsertChecklistMeterRule(checklistId, meterId, units);
    qc.invalidateQueries({ queryKey: ["checklist-meter-rule", checklistId] });
  };

  return (
    <div className="surface-card rounded-lg p-6">
      <h3 className="label-eyebrow flex items-center gap-2 mb-3">
        <Gauge className="h-4 w-4" /> Meter-based PM
      </h3>
      {assetIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Link equipment to this PM checklist to choose a meter and service interval.
        </p>
      ) : meters.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add meters on linked equipment, then set how many units between PMs.
        </p>
      ) : (
        <div className="space-y-3 max-w-md">
          <div>
            <Label className="text-xs">Meter</Label>
            <select
              className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
              value={meterId}
              onChange={(e) => setMeterId(e.target.value)}
            >
              <option value="">Select meter…</option>
              {meterOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Service every (units)</Label>
            <Input
              type="number"
              min={1}
              step="any"
              className="h-9 mt-1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder="e.g. 250"
            />
          </div>
          <Button size="sm" onClick={save} disabled={!meterId || !interval}>
            Save meter rule
          </Button>
          {rule?.meter && (
            <p className="text-xs text-muted-foreground">
              Last service at {rule.last_service_reading} {rule.meter.unit}; current{" "}
              {rule.meter.current_reading} {rule.meter.unit}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
