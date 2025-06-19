
import React from "react";
import { MapPin, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Location } from "@/services/locationService";

interface LocationsListViewProps {
  locations: Location[];
  isLoading: boolean;
  searchQuery: string;
  onAddSubLocation: (parentId: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
}

export const LocationsListView: React.FC<LocationsListViewProps> = ({
  locations,
  isLoading,
  searchQuery,
  onAddSubLocation,
  setIsAddDialogOpen
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-48">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No locations found matching your search" : "No locations found"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first location."}
          </p>
          {!searchQuery && (
            <Button 
              className="bg-maintenease-600 hover:bg-maintenease-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Location
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <Card key={location.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-maintenease-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-maintenease-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-medium">{location.name}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {location.description && (
              <CardDescription className="mb-4 line-clamp-2">
                {location.description}
              </CardDescription>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                <span>0 Assets</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAddSubLocation(location.id)}
                className="text-maintenease-600 hover:text-maintenease-700 hover:bg-maintenease-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Sub
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
