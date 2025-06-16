
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Location } from "@/services/locationService";

interface LocationCheckboxListProps {
  locations: Location[];
  selectedLocations: Set<string>;
  onToggleLocation: (locationId: string) => void;
}

export const LocationCheckboxList: React.FC<LocationCheckboxListProps> = ({
  locations,
  selectedLocations,
  onToggleLocation,
}) => {
  return (
    <div className="space-y-2">
      {locations.map((location) => (
        <div
          key={location.id}
          className="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50"
        >
          <Checkbox
            checked={selectedLocations.has(location.id)}
            onCheckedChange={() => onToggleLocation(location.id)}
          />
          <div className="flex-1">
            <p className="font-medium">{location.name}</p>
            {location.description && (
              <p className="text-sm text-gray-500">{location.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
