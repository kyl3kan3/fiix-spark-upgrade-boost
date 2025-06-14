
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";
import { LocationsListView } from "@/pages/locations/components/LocationsListView";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationsDialog } from "@/pages/locations/components/LocationsDialog";
import { LocationForm } from "@/components/locations/LocationForm";
import { useLocationActions } from "@/pages/locations/hooks/useLocationActions";
import { getLocationHierarchy, getAllLocations } from "@/services/locationService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LocationsPage = () => {
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedParentId,
    isCreating,
    isDeleting,
    handleAddLocation,
    handleDeleteLocation,
    handleAddSubLocation,
    handleDialogClose
  } = useLocationActions();

  // Fetch location hierarchy for hierarchy view - disable cache for debugging
  const { data: hierarchyLocations = [], isLoading: isHierarchyLoading } = useQuery({
    queryKey: ["locationHierarchy"],
    queryFn: getLocationHierarchy,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache the data
  });

  // Fetch all locations for list view and form options - disable cache for debugging
  const { data: allLocations = [], isLoading: isAllLocationsLoading } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache the data
  });

  console.log('🔍 LocationsPage render - hierarchyLocations:', hierarchyLocations);
  console.log('🔍 LocationsPage render - allLocations:', allLocations);

  const isLoading = viewMode === "hierarchy" ? isHierarchyLoading : isAllLocationsLoading;

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <LocationsHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />

        {viewMode === "hierarchy" ? (
          <LocationHierarchyView 
            locations={hierarchyLocations}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onAddSubLocation={handleAddSubLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        ) : (
          <LocationsListView
            locations={allLocations}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onAddSubLocation={handleAddSubLocation}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedParentId ? "Add Sub-Location" : "Add Location"}
              </DialogTitle>
            </DialogHeader>
            <LocationForm
              locations={allLocations}
              parentId={selectedParentId}
              onSubmit={handleAddLocation}
              onCancel={handleDialogClose}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
