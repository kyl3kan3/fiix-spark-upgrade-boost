
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationForm } from "@/components/locations/LocationForm";
import { Location, LocationWithChildren } from "@/services/locationService";

interface LocationDialogsProps {
  isAddDialogOpen: boolean;
  onAddDialogClose: () => void;
  isEditDialogOpen: boolean;
  onEditDialogClose: () => void;
  selectedParentId: string;
  editingLocation: LocationWithChildren | null;
  allLocations: Location[];
  onAddLocation: (data: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => Promise<void>;
  onEditLocation: (data: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
}

export const LocationDialogs: React.FC<LocationDialogsProps> = ({
  isAddDialogOpen,
  onAddDialogClose,
  isEditDialogOpen,
  onEditDialogClose,
  selectedParentId,
  editingLocation,
  allLocations,
  onAddLocation,
  onEditLocation,
  isCreating,
  isUpdating,
}) => {
  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={onAddDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <LocationForm
            locations={allLocations}
            parentId={selectedParentId}
            onSubmit={onAddLocation}
            onCancel={onAddDialogClose}
            isLoading={isCreating}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          {editingLocation && (
            <LocationForm
              locations={allLocations}
              initialData={{
                name: editingLocation.name,
                description: editingLocation.description || "",
                parent_id: editingLocation.parent_id,
              }}
              onSubmit={onEditLocation}
              onCancel={onEditDialogClose}
              isLoading={isUpdating}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
