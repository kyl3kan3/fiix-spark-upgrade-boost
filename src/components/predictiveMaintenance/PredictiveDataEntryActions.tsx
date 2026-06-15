import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponsiveGrid from "@/components/shell/ResponsiveGrid";
import {
  fetchScorableAssets,
  createFailureEvent,
  createHealthMetric,
  type CreateFailureEventData,
  type CreateHealthMetricData,
} from "@/services/predictiveMaintenanceService";

const ASSETS_KEY = ["predictive-maintenance", "scorable-assets"] as const;

function useScorableAssets() {
  return useQuery({
    queryKey: ASSETS_KEY,
    queryFn: fetchScorableAssets,
    staleTime: 1000 * 60 * 5,
  });
}

/** Field labels keep the metric picker readable without leaking enum values. */
const METRIC_TYPES: { value: CreateHealthMetricData["metric_type"]; label: string; unit: string }[] = [
  { value: "runtime_hours", label: "Runtime hours", unit: "hrs" },
  { value: "temperature", label: "Temperature", unit: "°C" },
  { value: "vibration", label: "Vibration", unit: "mm/s" },
  { value: "pressure", label: "Pressure", unit: "psi" },
  { value: "error_count", label: "Error count", unit: "" },
  { value: "manual_condition", label: "Condition score (0–100)", unit: "" },
];

const SEVERITIES: CreateFailureEventData["severity"][] = ["low", "medium", "high", "critical"];

function AssetSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: assets = [], isLoading } = useScorableAssets();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading assets…" : "Select an asset"} />
      </SelectTrigger>
      <SelectContent>
        {assets.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LogFailureDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [severity, setSeverity] = useState<CreateFailureEventData["severity"]>("medium");
  const [failedAt, setFailedAt] = useState("");
  const [downtime, setDowntime] = useState("");
  const [rootCause, setRootCause] = useState("");

  const reset = () => {
    setAssetId("");
    setSeverity("medium");
    setFailedAt("");
    setDowntime("");
    setRootCause("");
  };

  const mutation = useMutation({
    mutationFn: createFailureEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictive-maintenance"] });
      setOpen(false);
      reset();
    },
  });

  const submit = () => {
    if (!assetId) return;
    mutation.mutate({
      asset_id: assetId,
      severity,
      failed_at: failedAt ? new Date(failedAt).toISOString() : undefined,
      downtime_minutes: downtime ? Number(downtime) : null,
      root_cause: rootCause.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Log failure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a failure event</DialogTitle>
          <DialogDescription>
            Records a ground-truth breakdown. Failure history feeds the next risk computation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Asset</Label>
            <AssetSelect value={assetId} onChange={setAssetId} />
          </div>
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as CreateFailureEventData["severity"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s!} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="failure-downtime">Downtime (minutes)</Label>
              <Input
                id="failure-downtime"
                type="number"
                min={0}
                value={downtime}
                onChange={(e) => setDowntime(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </ResponsiveGrid>
          <div className="space-y-2">
            <Label htmlFor="failure-when">Failed at</Label>
            <Input
              id="failure-when"
              type="datetime-local"
              value={failedAt}
              onChange={(e) => setFailedAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave blank to use now.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="failure-cause">Root cause</Label>
            <Textarea
              id="failure-cause"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Optional — what went wrong?"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!assetId || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Record failure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LogReadingDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [metricType, setMetricType] = useState<CreateHealthMetricData["metric_type"]>("manual_condition");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setAssetId("");
    setMetricType("manual_condition");
    setValue("");
    setNotes("");
  };

  const mutation = useMutation({
    mutationFn: createHealthMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictive-maintenance"] });
      setOpen(false);
      reset();
    },
  });

  const selectedMetric = METRIC_TYPES.find((m) => m.value === metricType);

  const submit = () => {
    if (!assetId || value === "") return;
    mutation.mutate({
      asset_id: assetId,
      metric_type: metricType,
      value: Number(value),
      unit: selectedMetric?.unit || undefined,
      source: "manual",
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Log reading
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a condition reading</DialogTitle>
          <DialogDescription>
            Records a condition signal (temperature, vibration, runtime…) used to sharpen risk scores.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Asset</Label>
            <AssetSelect value={assetId} onChange={setAssetId} />
          </div>
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select
                value={metricType}
                onValueChange={(v) => setMetricType(v as CreateHealthMetricData["metric_type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_TYPES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reading-value">
                Value{selectedMetric?.unit ? ` (${selectedMetric.unit})` : ""}
              </Label>
              <Input
                id="reading-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 72"
              />
            </div>
          </ResponsiveGrid>
          <div className="space-y-2">
            <Label htmlFor="reading-notes">Notes</Label>
            <Textarea
              id="reading-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional context"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!assetId || value === "" || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Record reading"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Data-entry buttons (failure events + condition readings) for the PM page header. */
const PredictiveDataEntryActions: React.FC = () => (
  <>
    <LogReadingDialog />
    <LogFailureDialog />
  </>
);

export default PredictiveDataEntryActions;
