
import React from "react";
import { MapPin } from "lucide-react";

export const LocationEmptyState: React.FC = () => {
 return (
 <div className="text-center py-8 bg-card rounded-lg border">
 <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
 <h3 className="mt-2 text-sm font-medium text-foreground">No locations found</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Start by adding locations to organize your assets.
 </p>
 </div>
 );
};
