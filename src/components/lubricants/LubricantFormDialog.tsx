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
import { LUBRICANT_UNITS, type LubricantWithLinks } from "@/types/lubricants";
import type { CreateLubricantInput } from "@/types/lubricants";
import { useQuery } from "@tanstack/react-query";
import { getAllAssets } from "@/services/assets/assetQueries";
import { checklistService } from "@/services/checklistService";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: LubricantWithLinks | null;
  isPending?: boolean;
  onSubmit: (payload: CreateLubricantInput) => Promise<void>;
}

export function LubricantFormDialog({ open, onOpenChange, initial, isPending, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [lubricantType, setLubricantType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [unit, setUnit] = useState("L");
  const [notes, setNotes] = useState("");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [onHand, setOnHand] = useState("0");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [checklistIds, setChecklistIds] = useState<string[]>([]);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
    enabled: open,
  });

  const { data: checklists = [] } = useQuery({
    queryKey: ["checklists", "all"],
    queryFn: () => checklistService.getChecklists(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setLubricantType(initial.lubricant_type ?? "");
      setManufacturer(initial.manufacturer ?? "");
      setUnit(initial.unit_of_measure);
      setNotes(initial.notes ?? "");
      setReorderLevel(String(initial.reorder_level));
      setOnHand(String(initial.quantity_on_hand));
      setAssetIds(initial.lubricant_assets?.map((a) => a.asset_id) ?? []);
      setChecklistIds(initial.lubricant_checklists?.map((c) => c.checklist_id) ?? []);
    } else {
      setName("");
      setLubricantType("");
      setManufacturer("");
      setUnit("L");
      setNotes("");
      setReorderLevel("0");
      setOnHand("0");
      setAssetIds([]);
      setChecklistIds([]);
    }
  }, [open, initial]);

  const toggleId = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      lubricant_type: lubricantType.trim() || null,
      manufacturer: manufacturer.trim() || null,
      unit_of_measure: unit,
      notes: notes.trim() || null,
      reorder_level: Number(reorderLevel) || 0,
      quantity_on_hand: initial ? undefined : Number(onHand) || 0,
      asset_ids: assetIds,
      checklist_ids: checklistIds,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit lubricant" : "Add lubricant"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="lub-name">Name</Label>
            <Input id="lub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ISO VG 68 hydraulic oil" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type / grade</Label>
              <Input value={lubricantType} onChange={(e) => setLubricantType(e.target.value)} placeholder="ISO VG 68" />
            </div>
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LUBRICANT_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reorder level</Label>
              <Input type="number" min={0} step="any" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} />
            </div>
          </div>
          {!initial && (
            <div className="space-y-2">
              <Label>Starting on-hand quantity</Label>
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
              {assets.length === 0 ? (
                <p className="text-xs text-muted-foreground">No equipment yet.</p>
              ) : (
                assets.map((a: { id: string; name: string }) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={assetIds.includes(a.id)}
                      onCheckedChange={() => toggleId(assetIds, a.id, setAssetIds)}
                    />
                    {a.name}
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Linked lubrication PMs (checklists)</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {checklists.length === 0 ? (
                <p className="text-xs text-muted-foreground">No checklists yet.</p>
              ) : (
                checklists.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checklistIds.includes(c.id)}
                      onCheckedChange={() => toggleId(checklistIds, c.id, setChecklistIds)}
                    />
                    {c.name}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            {initial ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
