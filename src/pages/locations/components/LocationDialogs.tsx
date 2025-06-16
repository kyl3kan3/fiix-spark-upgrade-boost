
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationForm } from "@/components/locations/LocationForm";
import { LocationEditDialog } from "@/components/locations/LocationEditDialog";
import { Location } from "@/services/locationService";

interface LocationDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedParentId: string;
  editingLocation: any;
  allLocations: Location[];
  isCreating: boolean;
  isUpdating: boolean;
  onAddLocation: (data: { name: string; description: string; parent_id: string | null }) => Promise<void>;
  onEditLocation: (data: { name: string; description: string; parent_id: string | null }) => Promise<void>;
  onDialogClose: () => void;
  onEditDialogClose: () => void;
}

export const LocationDialogs: React.FC<LocationDialogsProps> = ({
  isAddDialogOpen,
  isEditDialogOpen,
  selectedParentId,
  editingLocation,
  allLocations,
  isCreating,
  isUpdating,
  onAddLocation,
  onEditLocation,
  onDialogClose,
  onEditDialogClose,
}) => {
  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={onDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedParentId ? "Add Sub-Location" : "Add Location"}
            </DialogTitle>
          </DialogHeader>
          <LocationForm
            locations={allLocations}
            parentId={selectedParentId}
            onSubmit={onAddLocation}
            onCancel={onDialogClose}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      <LocationEditDialog
        location={editingLocation}
        allLocations={allLocations}
        isOpen={isEditDialogOpen}
        onClose={onEditDialogClose}
        onSubmit={onEditLocation}
        isLoading={isUpdating}
      />
    </>
  );
};
