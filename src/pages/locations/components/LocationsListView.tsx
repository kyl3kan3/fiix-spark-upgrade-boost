
import React from "react";
import { MapPin, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Location } from "@/services/locationService";
import { Link } from "react-router-dom";

interface LocationsListViewProps {
 locations: Location[];
 isLoading: boolean;
 searchQuery: string;
 onAddSubLocation: (parentId: string) => void;
 setIsAddDialogOpen: (open: boolean) => void;
}

export const LocationsListView: React.FC<LocationsListViewProps> = ({
 locations,
 isLoading,
 searchQuery,
 onAddSubLocation,
 setIsAddDialogOpen
}) => {
 if (isLoading) {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
       {[...Array(6)].map((_, i) => (
         <div key={i} className="surface-card rounded-lg p-5 space-y-3">
           <Skeleton className="h-5 w-3/4" />
           <Skeleton className="h-4 w-1/2" />
           <Skeleton className="h-4 w-full" />
         </div>
       ))}
     </div>
   );
 }

 if (locations.length === 0) {
   return (
     <div className="flex flex-col items-center justify-center py-16 surface-card rounded-lg border border-dashed border-border">
       <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
         <Building2 className="h-7 w-7 text-primary/50" strokeWidth={1.5} />
       </div>
       <h3 className="font-headline font-semibold text-lg text-foreground mb-2">
         {searchQuery ? "No locations match your search" : "No locations found"}
       </h3>
       <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed mb-5">
         {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first location."}
       </p>
       {!searchQuery && (
         <Button
           className="bg-primary hover:bg-primary-variant text-primary-foreground"
           onClick={() => setIsAddDialogOpen(true)}
         >
           <Plus className="mr-2 h-4 w-4" />
           Create First Location
         </Button>
       )}
     </div>
   );
 }

 return (
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
     {locations.map((location) => (
       <div
         key={location.id}
         className="surface-card rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
       >
         {/* Card header */}
         <div className="bg-primary/5 px-5 pt-5 pb-4 flex items-start justify-between gap-3">
           <div className="flex items-center gap-3 min-w-0">
             <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <MapPin className="h-5 w-5 text-primary" />
             </div>
             <div className="min-w-0">
               <p className="label-eyebrow mb-0.5">Location</p>
               <h3 className="font-headline font-semibold text-base text-foreground truncate leading-tight">
                 {location.name}
               </h3>
             </div>
           </div>
           <Badge variant="outline" className="shrink-0 text-xs border-success/30 text-success bg-success/5">
             Active
           </Badge>
         </div>

         {/* Card body */}
         <div className="px-5 py-4 flex-1 flex flex-col justify-between">
           {location.description ? (
             <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
               {location.description}
             </p>
           ) : (
             <p className="text-sm text-muted-foreground italic mb-4">No description</p>
           )}

           <div className="pt-3 border-t border-border flex items-center justify-between">
             <Link
               to={`/assets?location_id=${location.id}`}
               className="text-xs text-primary hover:underline font-medium"
             >
               View Assets
             </Link>
             <Button
               variant="outline"
               size="sm"
               onClick={() => onAddSubLocation(location.id)}
               className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/5"
             >
               <Plus className="h-3 w-3 mr-1" />
               Add Sub
             </Button>
           </div>
         </div>
       </div>
     ))}
   </div>
 );
};
