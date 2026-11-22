import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gauge } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  const [createWorkOrder, setCreateWorkOrder] = useState(true);

  const { data: rule, isLoading, isError } = useQuery({
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

  const savedMeter = rule?.meter_id ?? "";
  const savedInterval = rule?.interval_units?.toString() ?? "";
  const savedWorkOrderSetting = rule?.auto_create_work_order ?? true;
  useEffect(() => {
    setMeterId(savedMeter);
    setInterval(savedInterval);
    setCreateWorkOrder(savedWorkOrderSetting);
  }, [checklistId, savedMeter, savedInterval, savedWorkOrderSetting]);

  const meterOptions = useMemo(
    () =>
      meters.map((m) => ({
        id: m.id,
        label: `${m.name} (${m.current_reading} ${m.unit})`,
      })),
    [meters],
  );

  const units = Number(interval);
  const save = useMutation({
    mutationFn: () => upsertChecklistMeterRule(checklistId, meterId, units, createWorkOrder),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checklist-meter-rule", checklistId] });
      qc.invalidateQueries({ queryKey: ["meter-rules"] });
      toast.success("Meter rule saved");
    },
    onError: (error) => toast.error(error.message || "Could not save meter rule"),
  });
  if (!enabled) return null;

  return (
    <div className="surface-card rounded-lg p-6">
      <h3 className="label-eyebrow flex items-center gap-2 mb-3">
        <Gauge className="h-4 w-4" /> Meter-based PM
      </h3>
      {isLoading || isError ? (
        <p className="text-sm text-muted-foreground">{isError ? "Could not load the meter rule." : "Loading meter rule…"}</p>
      ) : assetIds.length === 0 ? (
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
            <Label htmlFor="pm-meter" className="text-xs">Meter</Label>
            <select
              id="pm-meter"
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
            <Label htmlFor="pm-interval" className="text-xs">Service every (units)</Label>
            <Input
              id="pm-interval"
              type="number"
              min={0}
              step="any"
              className="h-9 mt-1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder="e.g. 250"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="meter-work-order" checked={createWorkOrder} onCheckedChange={setCreateWorkOrder} />
            <Label htmlFor="meter-work-order">Create a work order when service is due</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            A reading at or above the threshold marks this checklist due. Submit the checklist after service to start the next interval.
          </p>
          <Button size="sm" onClick={() => save.mutate()} disabled={!meters.some((m) => m.id === meterId) || !Number.isFinite(units) || units <= 0 || save.isPending}>
            Save meter rule
          </Button>
          {rule?.meter && (
            <p className="text-xs text-muted-foreground">
              Service threshold {rule.last_service_reading + rule.interval_units} {rule.meter.unit}. Current reading {rule.meter.current_reading} {rule.meter.unit}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
