
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLocationHierarchy, getAllLocations } from "@/services/locationService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Dialog } from "@/components/ui/dialog";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";
import { LocationsHeader } from "./locations/components/LocationsHeader";
import { LocationsListView } from "./locations/components/LocationsListView";
import { LocationsDialog } from "./locations/components/LocationsDialog";
import { useLocationActions } from "./locations/hooks/useLocationActions";

const LocationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  
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
  
  const { data: locationHierarchy, isLoading: isHierarchyLoading } = useQuery({
    queryKey: ["locationHierarchy"],
    queryFn: getLocationHierarchy
  });

  const { data: allLocations, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations
  });

  return (
    <DashboardLayout>
      <BackToDashboard />
      
      <LocationsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
      
      {viewMode === "hierarchy" ? (
        <LocationHierarchyView
          locations={locationHierarchy || []}
          isLoading={isHierarchyLoading}
          isDeleting={isDeleting}
          onAddSubLocation={handleAddSubLocation}
          onDeleteLocation={handleDeleteLocation}
        />
      ) : (
        <LocationsListView
          locations={allLocations || []}
          isLoading={isLocationsLoading}
          searchQuery={searchQuery}
          onAddSubLocation={handleAddSubLocation}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <LocationsDialog
          selectedParentId={selectedParentId}
          allLocations={allLocations || []}
          onSubmit={handleAddLocation}
          onCancel={handleDialogClose}
          isCreating={isCreating}
        />
      </Dialog>
    </DashboardLayout>
  );
};

export default LocationsPage;
