import { canReparent } from "@/lib/locationHierarchy";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationForm, type LocationFormData } from "./LocationForm";
import { Location } from "@/services/locationService";

interface LocationEditDialogProps {
 location: Location | null;
 allLocations: Location[];
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: LocationFormData) => Promise<void>;
 isLoading: boolean;
}

export const LocationEditDialog: React.FC<LocationEditDialogProps> = ({
 location,
 allLocations,
 isOpen,
 onClose,
 onSubmit,
 isLoading
}) => {
 if (!location) return null;

 const availableParents = allLocations.filter(loc => canReparent(allLocations, location.id, loc.id));

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
 parent_id: location.parent_id ?? null,
 image_url: location.image_url ?? null,
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
