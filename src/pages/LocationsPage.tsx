
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllLocations, createLocation } from "@/services/assetService";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const LocationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data: locations, isLoading, error, refetch } = useQuery({
    queryKey: ["locations"],
    queryFn: getAllLocations
  });

  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error("Location name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createLocation(newLocationName.trim());
      
      if (result.success) {
        toast.success("Location added successfully");
        // Invalidate the locations query to refetch data
        await queryClient.invalidateQueries({ queryKey: ["locations"] });
        setIsAddDialogOpen(false);
        setNewLocationName("");
      }
    } catch (err: any) {
      console.error("Error creating location:", err);
      toast.error(err.message || "Failed to add location");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setNewLocationName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleAddLocation();
    }
  };

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Enter the name of the new location to add it to your system.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Location name"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={handleDialogClose}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddLocation}
                  disabled={isCreating || !newLocationName.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isCreating ? "Adding..." : "Save Location"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading locations: {error.message}</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4"
          >
            Try Again
          </Button>
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
            <Card key={location.id} className="p-4 hover:shadow-md transition-shadow h-full">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-medium text-gray-900">{location.name}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <Link 
                      to={`/assets?location=${encodeURIComponent(location.name)}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Assets
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LocationsPage;
