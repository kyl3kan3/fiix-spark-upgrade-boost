
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const InspectionLoading: React.FC = () => {
  return (
    <div className="py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Loading inspection...</h1>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default InspectionLoading;
