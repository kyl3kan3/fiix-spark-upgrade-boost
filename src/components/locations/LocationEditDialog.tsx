
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationForm } from "./LocationForm";
import { Location } from "@/services/locationService";

interface LocationEditDialogProps {
  location: Location | null;
  allLocations: Location[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; parent_id: string | null }) => Promise<void>;
  isLoading: boolean;
}

// Helper function to get all descendant IDs of a location
const getDescendantIds = (locationId: string, locations: Location[]): string[] => {
  const descendants: string[] = [];
  const children = locations.filter(loc => loc.parent_id === locationId);
  
  for (const child of children) {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, locations));
  }
  
  return descendants;
};

export const LocationEditDialog: React.FC<LocationEditDialogProps> = ({
  location,
  allLocations,
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  if (!location) return null;

  // Filter out the location being edited and all its descendants from parent options
  const descendantIds = getDescendantIds(location.id, allLocations);
  const availableParents = allLocations.filter(loc => {
    // Exclude the location itself
    if (loc.id === location.id) return false;
    // Exclude all descendants to prevent circular references
    if (descendantIds.includes(loc.id)) return false;
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <LocationForm
          locations={availableParents}
          initialData={{
            name: location.name,
            description: location.description || "",
            parent_id: location.parent_id
          }}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
};
