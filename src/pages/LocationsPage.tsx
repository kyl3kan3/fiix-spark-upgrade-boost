
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { LocationsHeader } from "@/pages/locations/components/LocationsHeader";
import { LocationsTabContent } from "@/pages/locations/components/LocationsTabContent";
import { LocationDialogs } from "@/pages/locations/components/LocationDialogs";
import { useLocationPage } from "./locations/hooks/useLocationPage";
import { useLocationActions } from "./locations/hooks/useLocationActions";

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <BackToDashboard />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maintenease-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BackToDashboard />
        
        <LocationsHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsAddDialogOpen={setIsAddDialogOpen}
          onImportComplete={handleImportComplete}
        />

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

        <LocationDialogs
          isAddDialogOpen={isAddDialogOpen}
          onAddDialogClose={handleDialogClose}
          isEditDialogOpen={isEditDialogOpen}
          onEditDialogClose={handleEditDialogClose}
          selectedParentId={selectedParentId}
          editingLocation={editingLocation}
          allLocations={allLocations}
          onAddLocation={handleAddLocation}
          onEditLocation={handleEditLocation}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
