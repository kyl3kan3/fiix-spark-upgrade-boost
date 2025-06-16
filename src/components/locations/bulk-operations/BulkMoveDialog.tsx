
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Location } from "@/services/locationService";

interface BulkMoveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  targetParentId: string;
  onTargetParentChange: (value: string) => void;
  availableTargets: Location[];
  isProcessing: boolean;
  onConfirm: () => void;
}

export const BulkMoveDialog: React.FC<BulkMoveDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedCount,
  targetParentId,
  onTargetParentChange,
  availableTargets,
  isProcessing,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Selected Locations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Move {selectedCount} location(s) to a new parent:</p>
          <Select value={targetParentId} onValueChange={onTargetParentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select new parent location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent (root location)</SelectItem>
              {availableTargets.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Moving..." : "Move"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
