
import React from "react";
import { Loader2 } from "lucide-react";

const DashboardLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-maintenease-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center glass-morphism dark:glass-morphism-dark p-10 rounded-xl">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-lg font-medium">Loading your dashboard...</p>
        <p className="text-muted-foreground text-sm mt-2">Please wait while we prepare everything for you</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
