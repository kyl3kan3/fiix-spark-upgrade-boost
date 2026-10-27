import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, Plus } from "lucide-react";
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
import { createMeter, fetchMetersForAsset, recordMeterReading } from "@/services/meterService";

interface Props {
  assetId: string;
}

export function AssetMetersCard({ assetId }: Props) {
  const enabled = useHasFeature("meter_based_pm");
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("hrs");
  const [readingMeterId, setReadingMeterId] = useState<string | null>(null);
  const [readingValue, setReadingValue] = useState("");

  const { data: meters = [] } = useQuery({
    queryKey: ["meters", assetId],
    queryFn: () => fetchMetersForAsset(assetId),
    enabled,
  });

  if (!enabled) return null;

  const submitReading = async () => {
    if (!readingMeterId) return;
    const val = Number(readingValue);
    if (Number.isNaN(val)) return;
    await recordMeterReading(readingMeterId, val);
    setReadingMeterId(null);
    setReadingValue("");
    qc.invalidateQueries({ queryKey: ["meters", assetId] });
    qc.invalidateQueries({ queryKey: ["checklists"] });
  };

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
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setReadingMeterId(m.id)}>
                Log reading
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add meter</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Runtime hours" />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="hrs" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!name.trim()) return;
                await createMeter({ asset_id: assetId, name: name.trim(), unit });
                setAddOpen(false);
                setName("");
                qc.invalidateQueries({ queryKey: ["meters", assetId] });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!readingMeterId} onOpenChange={(o) => !o && setReadingMeterId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record meter reading</DialogTitle></DialogHeader>
          <Label>New reading (must be ≥ current)</Label>
          <Input type="number" min={0} step="any" value={readingValue} onChange={(e) => setReadingValue(e.target.value)} />
          <DialogFooter>
            <Button onClick={submitReading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
