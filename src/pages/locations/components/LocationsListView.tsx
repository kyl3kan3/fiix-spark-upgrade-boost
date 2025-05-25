
import React from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Location } from "@/services/locationService";

interface LocationsListViewProps {
  locations: Location[];
  isLoading: boolean;
  searchQuery: string;
  onAddSubLocation: (parentId: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
}

export const LocationsListView: React.FC<LocationsListViewProps> = ({
  locations,
  isLoading,
  searchQuery,
  onAddSubLocation,
  setIsAddDialogOpen
}) => {
  // Filter locations for search
  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredLocations?.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {searchQuery ? "No locations found matching your search" : "No locations found"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery ? "Try adjusting your search terms." : "Get started by creating a new location."}
        </p>
        {!searchQuery && (
          <div className="mt-6">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Location
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLocations?.map((location) => (
        <div key={location.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-medium text-gray-900">{location.name}</h3>
              {location.description && (
                <p className="text-sm text-gray-500 mt-1">{location.description}</p>
              )}
              <div className="mt-2 flex justify-between items-center">
                <button 
                  onClick={() => onAddSubLocation(location.id)}
                  className="text-sm text-primary hover:underline"
                >
                  Add Sublocation
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
