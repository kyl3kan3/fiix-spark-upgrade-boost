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
import type { LubricantWithLinks } from "@/types/lubricants";

interface Props {
  lubricant: LubricantWithLinks | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onAdjust: (args: { type: "receive" | "adjustment"; delta: number; notes?: string }) => Promise<void>;
}

export function StockAdjustDialog({ lubricant, open, onOpenChange, isPending, onAdjust }: Props) {
  const [type, setType] = useState<"receive" | "adjustment">("receive");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!lubricant) return;
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
          <DialogTitle>Adjust stock — {lubricant?.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          On hand: {lubricant?.quantity_on_hand} {lubricant?.unit_of_measure}
        </p>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "receive" | "adjustment")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receive">Receive (add stock)</SelectItem>
                <SelectItem value="adjustment">Adjustment (+ or −)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{type === "receive" ? "Quantity received" : "Quantity change (+/−)"}</Label>
            <Input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={type === "adjustment" ? "e.g. -2.5" : "e.g. 20"}
            />
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
