
import React from "react";
import { MapPin } from "lucide-react";

export const LocationEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 bg-white rounded-lg border">
      <MapPin className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Start by adding locations to organize your assets.
      </p>
    </div>
  );
};
