
import React from "react";

export const LocationLoadingState: React.FC = () => {
 return (
   <div className="surface-card rounded-lg overflow-hidden">
     <div className="px-5 py-4 border-b border-border bg-muted/30">
       <div className="h-5 w-40 bg-muted animate-pulse rounded" />
     </div>
     <div className="p-2">
       {[...Array(4)].map((_, i) => (
         <div key={i} className="flex items-center gap-3 px-5 py-3.5">
           <div className="w-8 h-8 rounded-lg bg-muted animate-pulse shrink-0" />
           <div className="flex-1 space-y-1.5">
             <div className="h-4 bg-muted animate-pulse rounded w-2/5" />
             <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
           </div>
         </div>
       ))}
     </div>
   </div>
 );
};
