
import React from "react";
import { 
  Accordion
} from "@/components/ui/accordion";
import { LocationWithChildren } from "@/services/locationService";
import { LocationNode } from "./LocationNode";
import { LocationEmptyState } from "./LocationEmptyState";
import { LocationLoadingState } from "./LocationLoadingState";

interface LocationHierarchyViewProps {
  locations: LocationWithChildren[];
  isLoading: boolean;
  isDeleting?: boolean;
  onAddSubLocation: (parentId: string) => void;
  onDeleteLocation: (locationId: string) => void;
  onEditLocation: (location: LocationWithChildren) => void;
}

export const LocationHierarchyView: React.FC<LocationHierarchyViewProps> = ({ 
  locations,
  isLoading,
  isDeleting = false,
  onAddSubLocation,
  onDeleteLocation,
  onEditLocation
}) => {
  if (isLoading) {
    return <LocationLoadingState />;
  }

  if (!locations || locations.length === 0) {
    return <LocationEmptyState />;
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h2 className="text-lg font-medium mb-4">Location Hierarchy</h2>
      <Accordion type="multiple" className="w-full">
        {locations.map((location) => (
          <LocationNode 
            key={location.id} 
            location={location} 
            level={0} 
            isDeleting={isDeleting}
            onAddSubLocation={onAddSubLocation}
            onDeleteLocation={onDeleteLocation}
            onEditLocation={onEditLocation}
          />
        ))}
      </Accordion>
    </div>
  );
};
