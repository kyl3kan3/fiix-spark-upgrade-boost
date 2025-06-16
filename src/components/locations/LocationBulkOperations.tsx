
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Move, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Location, deleteLocation, updateLocation } from "@/services/locationService";

interface LocationBulkOperationsProps {
  locations: Location[];
  onOperationComplete: () => void;
}

export const LocationBulkOperations: React.FC<LocationBulkOperationsProps> = ({
  locations,
  onOperationComplete
}) => {
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string>("none");
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleLocation = (locationId: string) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocations(newSelected);
  };

  const toggleAll = () => {
    if (selectedLocations.size === locations.length) {
      setSelectedLocations(new Set());
    } else {
      setSelectedLocations(new Set(locations.map(loc => loc.id)));
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    let deletedCount = 0;
    let errorCount = 0;

    for (const locationId of selectedLocations) {
      try {
        await deleteLocation(locationId);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete location ${locationId}:`, error);
        errorCount++;
      }
    }

    if (deletedCount > 0) {
      toast.success(`Deleted ${deletedCount} location(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} location(s)`);
    }

    setSelectedLocations(new Set());
    setIsDeleteDialogOpen(false);
    setIsProcessing(false);
    onOperationComplete();
  };

  const handleBulkMove = async () => {
    setIsProcessing(true);
    let movedCount = 0;
    let errorCount = 0;

    const newParentId = targetParentId === "none" ? null : targetParentId;

    for (const locationId of selectedLocations) {
      try {
        const location = locations.find(loc => loc.id === locationId);
        if (location) {
          await updateLocation(locationId, {
            name: location.name,
            description: location.description,
            parent_id: newParentId
          });
          movedCount++;
        }
      } catch (error) {
        console.error(`Failed to move location ${locationId}:`, error);
        errorCount++;
      }
    }

    if (movedCount > 0) {
      toast.success(`Moved ${movedCount} location(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to move ${errorCount} location(s)`);
    }

    setSelectedLocations(new Set());
    setIsMoveDialogOpen(false);
    setTargetParentId("none");
    setIsProcessing(false);
    onOperationComplete();
  };

  const selectedCount = selectedLocations.size;
  const availableTargets = locations.filter(loc => !selectedLocations.has(loc.id));

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
            className="flex items-center gap-2"
          >
            {selectedLocations.size === locations.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedLocations.size === locations.length ? "Deselect All" : "Select All"}
          </Button>
          
          {selectedCount > 0 && (
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMoveDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Move className="h-4 w-4" />
              Move
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Location List with Checkboxes */}
      <div className="space-y-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              checked={selectedLocations.has(location.id)}
              onCheckedChange={() => toggleLocation(location.id)}
            />
            <div className="flex-1">
              <p className="font-medium">{location.name}</p>
              {location.description && (
                <p className="text-sm text-gray-500">{location.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Locations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete {selectedCount} location(s)? This action cannot be undone.</p>
            <p className="text-sm text-red-600">
              Note: Locations with sub-locations or assets cannot be deleted and will be skipped.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Selected Locations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Move {selectedCount} location(s) to a new parent:</p>
            <Select value={targetParentId} onValueChange={setTargetParentId}>
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
                onClick={() => setIsMoveDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkMove}
                disabled={isProcessing}
              >
                {isProcessing ? "Moving..." : "Move"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
