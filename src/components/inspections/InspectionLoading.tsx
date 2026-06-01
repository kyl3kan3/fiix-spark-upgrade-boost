import React from "react";

const InspectionLoading: React.FC = () => {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-4 max-w-6xl">
        <div className="h-5 bg-muted rounded w-32" />
        <div className="h-9 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 h-48 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  );
};

export default InspectionLoading;
