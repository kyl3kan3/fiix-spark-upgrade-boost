import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { ScannedPart } from "@/services/scanService";
import { useAdjustPartStock } from "@/hooks/useParts";

interface Props {
  part: ScannedPart;
  onClose: () => void;
}

export function PartStockAdjustDialog({ part, onClose }: Props) {
  const adjustment = useAdjustPartStock();
  const [type, setType] = useState<"receive" | "adjustment">("receive");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const delta = Number(quantity);
  const valid = Number.isFinite(delta) && delta !== 0 && (type === "adjustment" || delta > 0);
  const handleSubmit = () => {
    if (!valid || adjustment.isPending) return;
    adjustment.mutate({ partId: part.id, type, delta, notes: notes.trim() || undefined }, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !adjustment.isPending) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock — {part.name}</DialogTitle>
          <DialogDescription>On hand: {part.quantity_on_hand} {part.unit_of_measure}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="adjust-stock-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "receive" | "adjustment")}>
              <SelectTrigger id="adjust-stock-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receive">Receive</SelectItem>
                <SelectItem value="adjustment">Adjustment (+/−)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjust-stock-quantity">Quantity</Label>
            <Input id="adjust-stock-quantity" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjust-stock-notes">Notes</Label>
            <Textarea id="adjust-stock-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        {adjustment.isError && <p role="alert" className="text-sm text-destructive">Could not save the stock adjustment. Check the quantity and try again.</p>}
        <DialogFooter>
          <Button variant="outline" disabled={adjustment.isPending} onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={adjustment.isPending || !valid}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
