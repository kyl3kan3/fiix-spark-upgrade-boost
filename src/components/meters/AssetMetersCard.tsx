import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHasFeature } from "@/hooks/useSubscription";
import {
  createMeter,
  fetchMeterRulesForMeters,
  fetchMetersForAsset,
  recordMeterReading,
} from "@/services/meterService";

interface Props {
  assetId: string;
}

export function AssetMetersCard({ assetId }: Props) {
  const enabled = useHasFeature("meter_based_pm");
  const apiEnabled = useHasFeature("api");
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("hrs");
  const [startingReading, setStartingReading] = useState("0");
  const [readingMeterId, setReadingMeterId] = useState<string | null>(null);
  const [readingValue, setReadingValue] = useState("");

  const { data: meters = [] } = useQuery({
    queryKey: ["meters", assetId],
    queryFn: () => fetchMetersForAsset(assetId),
    enabled,
  });

  const meterIds = meters.map((m) => m.id);
  const { data: meterRules = [] } = useQuery({
    queryKey: ["meter-rules", assetId, meterIds],
    queryFn: () => fetchMeterRulesForMeters(meterIds),
    enabled: enabled && meterIds.length > 0,
  });

  const selectedMeter = meters.find((m) => m.id === readingMeterId);
  const initialValue = Number(startingReading);
  const canAdd = name.trim() && unit.trim() && startingReading.trim() && Number.isFinite(initialValue) && initialValue >= 0;
  const addMeter = useMutation({
    mutationFn: () => createMeter({ asset_id: assetId, name: name.trim(), unit: unit.trim(), current_reading: initialValue }),
    onSuccess: () => {
      setAddOpen(false);
      setName("");
      setStartingReading("0");
      qc.invalidateQueries({ queryKey: ["meters", assetId] });
      qc.invalidateQueries({ queryKey: ["meters-for-checklist"] });
    },
    onError: (error) => toast.error(error.message || "Could not add meter"),
  });
  const value = Number(readingValue);
  const canRecord = selectedMeter && readingValue.trim() && Number.isFinite(value) && value >= selectedMeter.current_reading;
  const submitReading = useMutation({
    mutationFn: ({ id, reading }: { id: string; reading: number }) => recordMeterReading(id, reading),
    onSuccess: (reading) => {
      setReadingMeterId(null);
      setReadingValue("");
      for (const key of ["meters", "checklist-meter-rule", "meters-for-checklist", "checklists", "due-checklists", "scheduled-checklists", "asset-pm-checklists"]) {
        qc.invalidateQueries({ queryKey: [key] });
      }
      if (reading.work_orders_created) {
        for (const key of ["asset-work-orders", "workOrders", "dashboard-work-orders"]) {
          qc.invalidateQueries({ queryKey: [key] });
        }
      }
    },
    onError: (error) => toast.error(error.message || "Could not record reading"),
  });
  if (!enabled) return null;

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-eyebrow flex items-center gap-2">
          <Gauge className="h-4 w-4" /> Meters
        </h3>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>
      {meters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No meters on this asset. Add runtime or cycle counters for meter-based PM.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {meters.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
              <span className="font-medium">{m.name}</span>
              <span className="text-muted-foreground">{m.current_reading} {m.unit}</span>
              {apiEnabled && (
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(m.id);
                    toast.success("Meter ID copied");
                  } catch {
                    toast.info("Meter ID", { description: m.id });
                  }
                }}>
                  Copy meter ID
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setReadingValue(""); setReadingMeterId(m.id); }}>
                Log reading
              </Button>
            </li>
          ))}
        </ul>
      )}

      {meterRules.length > 0 && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Meter-based PM rules
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {meterRules.map((rule, i) => (
              <li key={i}>
                {(rule.checklist as { name?: string } | null)?.name ?? "PM checklist"} — every{" "}
                {rule.interval_units} units
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add meter</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="meter-name">Name</Label>
              <Input id="meter-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Runtime hours" />
            </div>
            <div>
              <Label htmlFor="meter-unit">Unit</Label>
              <Input id="meter-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="hrs" />
            </div>
            <div>
              <Label htmlFor="meter-initial-reading">Current reading</Label>
              <Input id="meter-initial-reading" type="number" min={0} step="any" value={startingReading} onChange={(e) => setStartingReading(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => addMeter.mutate()} disabled={!canAdd || addMeter.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!readingMeterId} onOpenChange={(o) => !o && setReadingMeterId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record meter reading</DialogTitle></DialogHeader>
          <Label htmlFor="asset-reading">New reading ({selectedMeter?.current_reading} {selectedMeter?.unit} or higher)</Label>
          <Input id="asset-reading" type="number" min={selectedMeter?.current_reading ?? 0} step="any" value={readingValue} onChange={(e) => setReadingValue(e.target.value)} />
          <DialogFooter>
            <Button disabled={!canRecord || submitReading.isPending} onClick={() => {
              if (canRecord) submitReading.mutate({ id: selectedMeter.id, reading: value });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
