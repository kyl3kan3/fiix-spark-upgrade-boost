import { useState } from "react";
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
import type { PartWithLinks } from "@/types/parts";

interface Props {
  part: PartWithLinks | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onAdjust: (args: { type: "receive" | "adjustment"; delta: number; notes?: string }) => Promise<void>;
}

export function PartStockAdjustDialog({ part, open, onOpenChange, isPending, onAdjust }: Props) {
  const [type, setType] = useState<"receive" | "adjustment">("receive");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!part) return;
    const signed = Number(quantity);
    if (Number.isNaN(signed) || signed === 0) return;
    if (type === "receive" && signed < 0) return;
    await onAdjust({ type, delta: signed, notes: notes.trim() || undefined });
    setQuantity("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock — {part?.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          On hand: {part?.quantity_on_hand} {part?.unit_of_measure}
        </p>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "receive" | "adjustment")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receive">Receive</SelectItem>
                <SelectItem value="adjustment">Adjustment (+/−)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !quantity}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
