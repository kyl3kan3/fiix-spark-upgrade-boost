
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";
import { LocationsListView } from "@/pages/locations/components/LocationsListView";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationFilters } from "@/components/locations/LocationFilters";
import { LocationForm } from "@/components/locations/LocationForm";
import { LocationEditDialog } from "@/components/locations/LocationEditDialog";
import { useLocationActions } from "@/pages/locations/hooks/useLocationActions";
import { getLocationHierarchy, getAllLocations } from "@/services/locationService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LocationsPage = () => {
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

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
  const { data: hierarchyLocations = [], isLoading: isHierarchyLoading, refetch: refetchHierarchy } = useQuery({
    queryKey: ["locationHierarchy"],
    queryFn: getLocationHierarchy,
  });

  // Fetch all locations for list view and form options
  const { data: allLocations = [], isLoading: isAllLocationsLoading, refetch: refetchAll } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations,
  });

  const isLoading = viewMode === "hierarchy" ? isHierarchyLoading : isAllLocationsLoading;

  // Filter locations based on search and filters
  const filteredLocations = React.useMemo(() => {
    let filtered = allLocations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply parent filter
    if (parentFilter !== "all") {
      if (parentFilter === "root") {
        filtered = filtered.filter(location => !location.parent_id);
      } else {
        filtered = filtered.filter(location => location.parent_id === parentFilter);
      }
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(location => {
        const createdDate = new Date(location.created_at);
        
        switch (dateFilter) {
          case "today":
            return createdDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return createdDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return createdDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allLocations, searchQuery, parentFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setParentFilter("all");
    setDateFilter("all");
  };

  const handleImportComplete = () => {
    refetchHierarchy();
    refetchAll();
  };

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
          onImportComplete={handleImportComplete}
        />

        <LocationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          parentFilter={parentFilter}
          setParentFilter={setParentFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locations={allLocations}
          onClearFilters={handleClearFilters}
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
            locations={filteredLocations}
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
