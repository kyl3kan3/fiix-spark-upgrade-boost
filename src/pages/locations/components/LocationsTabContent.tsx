
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";
import { LocationsListView } from "@/pages/locations/components/LocationsListView";
import { LocationAnalytics } from "@/components/locations/LocationAnalytics";
import { LocationBulkOperations } from "@/components/locations/LocationBulkOperations";
import { LocationFilters } from "@/components/locations/LocationFilters";
import { Location, LocationWithChildren } from "@/services/locationService";

interface LocationsTabContentProps {
  viewMode: "hierarchy" | "list" | "analytics" | "bulk";
  hierarchyLocations: LocationWithChildren[];
  allLocations: Location[];
  filteredLocations: Location[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  parentFilter: string;
  setParentFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  onClearFilters: () => void;
  onAddSubLocation: (parentId: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  onDeleteLocation: (locationId: string) => void;
  onEditLocationClick: (location: LocationWithChildren) => void;
  onOperationComplete: () => void;
  isDeleting: boolean;
}

export const LocationsTabContent: React.FC<LocationsTabContentProps> = ({
  viewMode,
  hierarchyLocations,
  allLocations,
  filteredLocations,
  isLoading,
  searchQuery,
  setSearchQuery,
  parentFilter,
  setParentFilter,
  dateFilter,
  setDateFilter,
  onClearFilters,
  onAddSubLocation,
  setIsAddDialogOpen,
  onDeleteLocation,
  onEditLocationClick,
  onOperationComplete,
  isDeleting,
}) => {
  return (
    <Tabs value={viewMode} className="w-full">
      {(viewMode === "hierarchy" || viewMode === "list") && (
        <LocationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          parentFilter={parentFilter}
          setParentFilter={setParentFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locations={allLocations}
          onClearFilters={onClearFilters}
        />
      )}

      <div className="mt-6">
        <TabsContent value="hierarchy" className="mt-0">
          <LocationHierarchyView 
            locations={hierarchyLocations}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onAddSubLocation={onAddSubLocation}
            onDeleteLocation={onDeleteLocation}
            onEditLocation={onEditLocationClick}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <LocationsListView
            locations={filteredLocations}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onAddSubLocation={onAddSubLocation}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <LocationAnalytics />
        </TabsContent>

        <TabsContent value="bulk" className="mt-0">
          <LocationBulkOperations
            locations={allLocations}
            onOperationComplete={onOperationComplete}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
