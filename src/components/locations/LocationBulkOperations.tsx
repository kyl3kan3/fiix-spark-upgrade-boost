
import React from "react";
import { Location } from "@/services/locationService";
import { BulkSelectionControls } from "./bulk-operations/BulkSelectionControls";
import { LocationCheckboxList } from "./bulk-operations/LocationCheckboxList";
import { BulkDeleteDialog } from "./bulk-operations/BulkDeleteDialog";
import { BulkMoveDialog } from "./bulk-operations/BulkMoveDialog";
import { useBulkOperations } from "./bulk-operations/useBulkOperations";

interface LocationBulkOperationsProps {
  locations: Location[];
  onOperationComplete: () => void;
}

export const LocationBulkOperations: React.FC<LocationBulkOperationsProps> = ({
  locations,
  onOperationComplete
}) => {
  const {
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
  } = useBulkOperations(locations, onOperationComplete);

  const selectedCount = selectedLocations.size;
  const availableTargets = locations.filter(loc => !selectedLocations.has(loc.id));

  return (
    <div className="space-y-4">
      <BulkSelectionControls
        selectedCount={selectedCount}
        totalCount={locations.length}
        onToggleAll={toggleAll}
        onMove={() => setIsMoveDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <LocationCheckboxList
        locations={locations}
        selectedLocations={selectedLocations}
        onToggleLocation={toggleLocation}
      />

      <BulkDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedCount={selectedCount}
        isProcessing={isProcessing}
        onConfirm={handleBulkDelete}
      />

      <BulkMoveDialog
        isOpen={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        selectedCount={selectedCount}
        targetParentId={targetParentId}
        onTargetParentChange={setTargetParentId}
        availableTargets={availableTargets}
        isProcessing={isProcessing}
        onConfirm={handleBulkMove}
      />
    </div>
  );
};
