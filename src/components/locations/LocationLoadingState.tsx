
import React from "react";

export const LocationLoadingState: React.FC = () => {
 return (
 <div className="space-y-2">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="animate-pulse">
 <div className="h-10 bg-muted rounded-md mb-2"></div>
 <div className="h-10 bg-muted rounded-md ml-6"></div>
 </div>
 ))}
 </div>
 );
};
