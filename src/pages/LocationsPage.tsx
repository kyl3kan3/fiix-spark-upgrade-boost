
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getLocationHierarchy, getAllLocations, createLocation } from "@/services/locationService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LocationHierarchyView } from "@/components/locations/LocationHierarchyView";
import { LocationForm } from "@/components/locations/LocationForm";

const LocationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  
  const queryClient = useQueryClient();
  
  const { data: locationHierarchy, isLoading: isHierarchyLoading } = useQuery({
    queryKey: ["locationHierarchy"],
    queryFn: getLocationHierarchy
  });

  const { data: allLocations, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations
  });

  const handleAddLocation = async (locationData: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => {
    setIsCreating(true);
    try {
      await createLocation(locationData);
      toast.success("Location added successfully");
      
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["locationHierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["allLocations"] });
      
      setIsAddDialogOpen(false);
      setSelectedParentId("");
    } catch (err: any) {
      console.error("Error creating location:", err);
      toast.error(err.message || "Failed to add location");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddSubLocation = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setSelectedParentId("");
  };

  // Filter locations for search in list view
  const filteredLocations = allLocations?.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "hierarchy" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("hierarchy")}
              className="rounded-r-none"
            >
              Hierarchy
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>

          {viewMode === "list" && (
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search locations..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedParentId ? "Add Sublocation" : "Add New Location"}
                </DialogTitle>
                <DialogDescription>
                  {selectedParentId 
                    ? "Add a sublocation under the selected parent location."
                    : "Create a new location to organize your assets."
                  }
                </DialogDescription>
              </DialogHeader>
              <LocationForm
                locations={allLocations || []}
                parentId={selectedParentId}
                onSubmit={handleAddLocation}
                onCancel={handleDialogClose}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {viewMode === "hierarchy" ? (
        <LocationHierarchyView
          locations={locationHierarchy || []}
          isLoading={isHierarchyLoading}
          onAddSubLocation={handleAddSubLocation}
        />
      ) : (
        // List view
        <>
          {isLocationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                </div>
              ))}
            </div>
          ) : filteredLocations?.length === 0 ? (
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
          ) : (
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
                          onClick={() => handleAddSubLocation(location.id)}
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
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default LocationsPage;
