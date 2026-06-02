
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const TeamMembersLoading: React.FC = () => {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <div key={i} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
 <div className="p-6 flex flex-col items-center gap-3">
 <Skeleton className="h-20 w-20 rounded-full" />
 <Skeleton className="h-5 w-32" />
 <Skeleton className="h-4 w-20" />
 <Skeleton className="h-3 w-36 mt-1" />
 <Skeleton className="h-3 w-28" />
 </div>
 <div className="border-t border-border bg-background/50 px-5 py-3 flex items-center justify-between">
 <Skeleton className="h-4 w-16" />
 <Skeleton className="h-8 w-28" />
 </div>
 </div>
 ))}
 </div>
 );
};

export default TeamMembersLoading;
