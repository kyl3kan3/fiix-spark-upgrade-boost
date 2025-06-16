
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";
import { LocationsListView } from "@/pages/locations/components/LocationsListView";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationForm } from "@/components/locations/LocationForm";
import { LocationEditDialog } from "@/components/locations/LocationEditDialog";
import { useLocationActions } from "@/pages/locations/hooks/useLocationActions";
import { getLocationHierarchy, getAllLocations } from "@/services/locationService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LocationsPage = () => {
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    selectedParentId,
    editingLocation,
    isCreating,
    isUpdating,
    isDeleting,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddSubLocation,
    handleEditLocationClick,
    handleDialogClose,
    handleEditDialogClose
  } = useLocationActions();

  // Fetch location hierarchy for hierarchy view
  const { data: hierarchyLocations = [], isLoading: isHierarchyLoading } = useQuery({
    queryKey: ["locationHierarchy"],
    queryFn: getLocationHierarchy,
  });

  // Fetch all locations for list view and form options
  const { data: allLocations = [], isLoading: isAllLocationsLoading } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations,
  });

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
            onEditLocation={handleEditLocationClick}
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

        <LocationEditDialog
          location={editingLocation}
          allLocations={allLocations}
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
          onSubmit={handleEditLocation}
          isLoading={isUpdating}
        />
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
