
import React from "react";
import { Accordion } from "@/components/ui/accordion";
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
   <div className="surface-card rounded-xl border border-border overflow-hidden">
     <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
       <h2 className="font-headline font-semibold text-base text-foreground">Location Hierarchy</h2>
       <span className="label-eyebrow">{locations.length} site{locations.length !== 1 ? "s" : ""}</span>
     </div>
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
