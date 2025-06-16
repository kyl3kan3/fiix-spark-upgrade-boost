
import { useState } from "react";
import { toast } from "sonner";
import { Location, deleteLocation, updateLocation } from "@/services/locationService";

export const useBulkOperations = (locations: Location[], onOperationComplete: () => void) => {
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

  return {
    selectedLocations,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    targetParentId,
    setTargetParentId,
    isProcessing,
    toggleLocation,
    toggleAll,
    handleBulkDelete,
    handleBulkMove,
  };
};
