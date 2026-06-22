import React, { useState } from "react";
import { Plus } from "lucide-react";
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
import type { EnergyAsset, CreateEnergyReadingData } from "@/services/energyService";

const NO_ASSET = "__none__";

interface Props {
  assets: EnergyAsset[];
  isPending: boolean;
  onCreate: (payload: CreateEnergyReadingData) => Promise<void>;
}

const LogEnergyReadingDialog: React.FC<Props> = ({ assets, isPending, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState(NO_ASSET);
  const [meterLabel, setMeterLabel] = useState("");
  const [readingDate, setReadingDate] = useState("");
  const [kwh, setKwh] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setAssetId(NO_ASSET);
    setMeterLabel("");
    setReadingDate("");
    setKwh("");
    setCost("");
    setCurrency("USD");
    setNotes("");
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const canSubmit = kwh !== "" && Number(kwh) >= 0;

  const submit = async () => {
    if (!canSubmit) return;
    await onCreate({
      asset_id: assetId === NO_ASSET ? null : assetId,
      meter_label: meterLabel.trim() || null,
      reading_date: readingDate ? new Date(readingDate).toISOString() : undefined,
      kwh: Number(kwh),
      cost: cost !== "" ? Number(cost) : null,
      currency: currency.trim().toUpperCase() || "USD",
      notes: notes.trim() || undefined,
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log reading
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log an energy reading</DialogTitle>
          <DialogDescription>
            Record a kWh reading (and optional cost) for a meter or piece of equipment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label htmlFor="energy-kwh">kWh</Label>
              <Input
                id="energy-kwh"
                type="number"
                min={0}
                step="0.01"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                placeholder="e.g. 120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy-date">Reading date</Label>
              <Input
                id="energy-date"
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank to use today.</p>
            </div>
          </ResponsiveGrid>
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label htmlFor="energy-cost">Cost (optional)</Label>
              <Input
                id="energy-cost"
                type="number"
                min={0}
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 24.50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy-currency">Currency</Label>
              <Input
                id="energy-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
                placeholder="USD"
              />
            </div>
          </ResponsiveGrid>
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger aria-label="Asset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_ASSET}>No specific asset</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy-meter">Meter label (optional)</Label>
              <Input
                id="energy-meter"
                value={meterLabel}
                onChange={(e) => setMeterLabel(e.target.value)}
                placeholder="e.g. Main building"
              />
            </div>
          </ResponsiveGrid>
          <div className="space-y-2">
            <Label htmlFor="energy-notes">Notes</Label>
            <Textarea
              id="energy-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional context"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending ? "Saving…" : "Record reading"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogEnergyReadingDialog;
