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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PART_UNITS, type PartWithLinks } from "@/types/parts";
import type { CreatePartInput } from "@/types/parts";
import { useQuery } from "@tanstack/react-query";
import { getAllAssets } from "@/services/assets/assetQueries";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: PartWithLinks | null;
  isPending?: boolean;
  onSubmit: (payload: CreatePartInput) => Promise<void>;
}

export function PartFormDialog({ open, onOpenChange, initial, isPending, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [unit, setUnit] = useState("ea");
  const [notes, setNotes] = useState("");
  const [minQty, setMinQty] = useState("0");
  const [onHand, setOnHand] = useState("0");
  const [assetIds, setAssetIds] = useState<string[]>([]);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setPartNumber(initial.part_number ?? "");
      setManufacturer(initial.manufacturer ?? "");
      setUnit(initial.unit_of_measure);
      setNotes(initial.notes ?? "");
      setMinQty(String(initial.min_quantity));
      setOnHand(String(initial.quantity_on_hand));
      setAssetIds(initial.part_assets?.map((a) => a.asset_id) ?? []);
    } else {
      setName("");
      setPartNumber("");
      setManufacturer("");
      setUnit("ea");
      setNotes("");
      setMinQty("0");
      setOnHand("0");
      setAssetIds([]);
    }
  }, [open, initial]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      part_number: partNumber.trim() || null,
      manufacturer: manufacturer.trim() || null,
      unit_of_measure: unit,
      notes: notes.trim() || null,
      min_quantity: Number(minQty) || 0,
      quantity_on_hand: initial ? undefined : Number(onHand) || 0,
      asset_ids: assetIds,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit part" : "Add part"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Part number</Label>
              <Input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PART_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min quantity</Label>
              <Input type="number" min={0} step="any" value={minQty} onChange={(e) => setMinQty(e.target.value)} />
            </div>
          </div>
          {!initial && (
            <div className="space-y-2">
              <Label>Starting on-hand</Label>
              <Input type="number" min={0} step="any" value={onHand} onChange={(e) => setOnHand(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Linked equipment</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {assets.map((a: { id: string; name: string }) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={assetIds.includes(a.id)}
                    onCheckedChange={() =>
                      setAssetIds((ids) =>
                        ids.includes(a.id) ? ids.filter((x) => x !== a.id) : [...ids, a.id],
                      )
                    }
                  />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
