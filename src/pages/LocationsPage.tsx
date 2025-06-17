
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import LocationsHeader from "./locations/components/LocationsHeader";
import LocationFilters from "@/components/locations/LocationFilters";
import LocationHierarchyView from "@/components/locations/LocationHierarchyView";
import LocationsListView from "./locations/components/LocationsListView";
import LocationAnalytics from "@/components/locations/LocationAnalytics";
import LocationForm from "@/components/locations/LocationForm";
import { useLocationPage } from "./locations/hooks/useLocationPage";

const LocationsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { locations, isLoading } = useLocationPage();

  const filteredLocations = locations.filter((location) => {
    const matchesSearch = !filters.search || 
      location.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      location.address?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === "all" || location.type === filters.type;
    const matchesStatus = filters.status === "all" || location.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <LocationsHeader />
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Add Location</span>
          </Button>
        </div>

        <Tabs defaultValue="hierarchy" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 min-w-[300px]">
              <TabsTrigger value="hierarchy" className="text-xs sm:text-sm">
                <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Hierarchy</span>
                <span className="sm:hidden">Tree</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs sm:text-sm">List View</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="hierarchy" className="mt-0 space-y-4 sm:space-y-6">
            <LocationFilters filters={filters} setFilters={setFilters} />
            <LocationHierarchyView locations={filteredLocations} />
          </TabsContent>
          
          <TabsContent value="list" className="mt-0 space-y-4 sm:space-y-6">
            <LocationFilters filters={filters} setFilters={setFilters} />
            <LocationsListView locations={filteredLocations} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <LocationAnalytics />
          </TabsContent>
        </Tabs>

        <LocationForm 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
