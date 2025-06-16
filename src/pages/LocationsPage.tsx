
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationsTabContent } from "@/pages/locations/components/LocationsTabContent";
import { LocationDialogs } from "@/pages/locations/components/LocationDialogs";
import { useLocationActions } from "@/pages/locations/hooks/useLocationActions";
import { useLocationPage } from "@/pages/locations/hooks/useLocationPage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, List, TreePine, Settings } from "lucide-react";

const LocationsPage = () => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    parentFilter,
    setParentFilter,
    dateFilter,
    setDateFilter,
    hierarchyLocations,
    allLocations,
    filteredLocations,
    isLoading,
    handleClearFilters,
    handleImportComplete,
    handleOperationComplete,
  } = useLocationPage();

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

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Bulk Operations
            </TabsTrigger>
          </TabsList>

          <LocationsTabContent
            viewMode={viewMode}
            hierarchyLocations={hierarchyLocations}
            allLocations={allLocations}
            filteredLocations={filteredLocations}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            parentFilter={parentFilter}
            setParentFilter={setParentFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onClearFilters={handleClearFilters}
            onAddSubLocation={handleAddSubLocation}
            setIsAddDialogOpen={setIsAddDialogOpen}
            onDeleteLocation={handleDeleteLocation}
            onEditLocationClick={handleEditLocationClick}
            onOperationComplete={handleOperationComplete}
            isDeleting={isDeleting}
          />
        </Tabs>

        <LocationDialogs
          isAddDialogOpen={isAddDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          selectedParentId={selectedParentId}
          editingLocation={editingLocation}
          allLocations={allLocations}
          isCreating={isCreating}
          isUpdating={isUpdating}
          onAddLocation={handleAddLocation}
          onEditLocation={handleEditLocation}
          onDialogClose={handleDialogClose}
          onEditDialogClose={handleEditDialogClose}
        />
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
