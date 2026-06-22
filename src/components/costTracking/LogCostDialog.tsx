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
import { COST_CATEGORIES, MAINTENANCE_TYPES, type CostCategory, type MaintenanceType } from "@/lib/costAnalytics";
import type { CostableAsset, CreateMaintenanceCostData } from "@/services/costTrackingService";

const NO_ASSET = "__none__";

const CATEGORY_LABELS: Record<CostCategory, string> = {
  labor: "Labor",
  parts: "Parts",
  contractor: "Contractor",
  downtime: "Downtime",
  other: "Other",
};

const TYPE_LABELS: Record<MaintenanceType, string> = {
  preventive: "Preventive",
  reactive: "Reactive",
  other: "Other",
};

interface Props {
  assets: CostableAsset[];
  isPending: boolean;
  onCreate: (payload: CreateMaintenanceCostData) => Promise<void>;
}

const LogCostDialog: React.FC<Props> = ({ assets, isPending, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState<string>(NO_ASSET);
  const [category, setCategory] = useState<CostCategory>("parts");
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>("reactive");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [incurredAt, setIncurredAt] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setAssetId(NO_ASSET);
    setCategory("parts");
    setMaintenanceType("reactive");
    setAmount("");
    setCurrency("USD");
    setIncurredAt("");
    setDescription("");
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const canSubmit = amount !== "" && Number(amount) >= 0;

  const submit = async () => {
    if (!canSubmit) return;
    await onCreate({
      asset_id: assetId === NO_ASSET ? null : assetId,
      category,
      maintenance_type: maintenanceType,
      amount: Number(amount),
      currency: currency.trim().toUpperCase() || "USD",
      incurred_at: incurredAt ? new Date(incurredAt).toISOString() : undefined,
      description: description.trim() || undefined,
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log cost
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a maintenance cost</DialogTitle>
          <DialogDescription>
            Record money spent on maintenance. Tag it preventive vs. reactive to track where the savings are.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label htmlFor="cost-amount">Amount</Label>
              <Input
                id="cost-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 250"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-currency">Currency</Label>
              <Input
                id="cost-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
                placeholder="USD"
              />
            </div>
          </ResponsiveGrid>
          <ResponsiveGrid cols={{ base: 1, sm: 2 }} gap={4}>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CostCategory)}>
                <SelectTrigger aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={maintenanceType} onValueChange={(v) => setMaintenanceType(v as MaintenanceType)}>
                <SelectTrigger aria-label="Maintenance type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="cost-incurred">Date</Label>
              <Input
                id="cost-incurred"
                type="date"
                value={incurredAt}
                onChange={(e) => setIncurredAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank to use today.</p>
            </div>
          </ResponsiveGrid>
          <div className="space-y-2">
            <Label htmlFor="cost-description">Description</Label>
            <Textarea
              id="cost-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what was this for?"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending ? "Saving…" : "Record cost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogCostDialog;
