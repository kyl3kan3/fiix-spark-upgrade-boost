
import React from "react";
import { MapPin } from "lucide-react";

interface LocationAnalyticsEmptyProps {
 className?: string;
}

export const LocationAnalyticsEmpty: React.FC<LocationAnalyticsEmptyProps> = ({ className }) => {
 return (
 <div className={`text-center py-8 ${className}`}>
 <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
 <h3 className="mt-2 text-sm font-medium text-foreground">No location data</h3>
 <p className="mt-1 text-sm text-muted-foreground">Create some locations to see analytics.</p>
 </div>
 );
};
