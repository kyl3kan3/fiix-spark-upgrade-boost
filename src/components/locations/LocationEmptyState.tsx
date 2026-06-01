
import React from "react";
import { MapPin } from "lucide-react";

export const LocationEmptyState: React.FC = () => {
 return (
   <div className="flex flex-col items-center justify-center py-16 surface-card rounded-lg border border-dashed border-border">
     <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
       <MapPin className="h-7 w-7 text-primary/50" strokeWidth={1.5} />
     </div>
     <h3 className="font-headline font-semibold text-lg text-foreground mb-2">No locations found</h3>
     <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
       Start by adding locations to organise your assets and facility hierarchy.
     </p>
   </div>
 );
};
