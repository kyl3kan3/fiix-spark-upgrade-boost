
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const TeamMembersLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-28 mb-3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMembersLoading;
