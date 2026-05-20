
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VendorGridSkeleton: React.FC = () => {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-4 bg-card dark:bg-card border border-border dark:border-border">
 <Skeleton className="h-6 w-3/4 mb-4 bg-secondary dark:bg-card" />
 <Skeleton className="h-4 w-1/2 mb-2 bg-secondary dark:bg-card" />
 <Skeleton className="h-4 w-1/4 bg-secondary dark:bg-card" />
 </Card>
 ))}
 </div>
 );
};

export default VendorGridSkeleton;
