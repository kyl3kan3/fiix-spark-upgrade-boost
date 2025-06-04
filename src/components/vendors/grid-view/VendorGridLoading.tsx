
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VendorGridLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Skeleton className="h-6 w-3/4 mb-4 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/2 mb-2 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700" />
        </Card>
      ))}
    </div>
  );
};

export default VendorGridLoading;
