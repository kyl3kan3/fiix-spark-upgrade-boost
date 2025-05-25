
import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LocationForm } from "@/components/locations/LocationForm";
import { Location } from "@/services/locationService";

interface LocationsDialogProps {
  selectedParentId: string;
  allLocations: Location[];
  onSubmit: (data: { name: string; description: string; parent_id: string | null }) => Promise<void>;
  onCancel: () => void;
  isCreating: boolean;
}

export const LocationsDialog: React.FC<LocationsDialogProps> = ({
  selectedParentId,
  allLocations,
  onSubmit,
  onCancel,
  isCreating
}) => {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {selectedParentId ? "Add Sublocation" : "Add New Location"}
        </DialogTitle>
        <DialogDescription>
          {selectedParentId 
            ? "Add a sublocation under the selected parent location."
            : "Create a new location to organize your assets."
          }
        </DialogDescription>
      </DialogHeader>
      <LocationForm
        locations={allLocations || []}
        parentId={selectedParentId}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isLoading={isCreating}
      />
    </DialogContent>
  );
};
