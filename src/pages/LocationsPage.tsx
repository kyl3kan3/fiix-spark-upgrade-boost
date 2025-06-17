
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { useLocationPage } from "./locations/hooks/useLocationPage";

const LocationsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const locationPageData = useLocationPage();
  const isLoading = false;

  // Mock locations data
  const mockLocations = [
    {
      id: 1,
      name: "Main Facility",
      type: "Building",
      address: "123 Industrial Dr, Manufacturing City, ST 12345",
      status: "active",
      assets: 45,
      workOrders: 12
    },
    {
      id: 2,
      name: "Warehouse A",
      type: "Warehouse",
      address: "456 Storage Ln, Distribution Hub, ST 12346",
      status: "active",
      assets: 23,
      workOrders: 3
    },
    {
      id: 3,
      name: "Office Building",
      type: "Office",
      address: "789 Corporate Blvd, Business District, ST 12347",
      status: "active",
      assets: 15,
      workOrders: 5
    }
  ];

  const filteredLocations = mockLocations.filter((location) => {
    const matchesSearch = !filters.search || 
      location.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
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
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Locations</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your facility locations and hierarchies</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Add Location</span>
          </Button>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 min-w-[300px]">
              <TabsTrigger value="list" className="text-xs sm:text-sm">
                <Building className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">List View</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="text-xs sm:text-sm">
                <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Hierarchy</span>
                <span className="sm:hidden">Tree</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="text-xs sm:text-sm">
                <Map className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Map View</span>
                <span className="sm:hidden">Map</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="mt-0 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{location.name}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {location.status}
                      </span>
                    </CardTitle>
                    <CardDescription>{location.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{location.address}</p>
                    <div className="flex justify-between text-sm">
                      <span>{location.assets} Assets</span>
                      <span>{location.workOrders} Work Orders</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="hierarchy" className="mt-0 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Hierarchy</CardTitle>
                <CardDescription>View the organizational structure of your locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">🏢 Company Headquarters</div>
                  <div className="ml-4 space-y-1">
                    <div>📍 Main Facility</div>
                    <div className="ml-4 text-sm text-gray-600">
                      • Production Floor A<br/>
                      • Production Floor B<br/>
                      • Quality Control Lab
                    </div>
                    <div>📍 Warehouse A</div>
                    <div className="ml-4 text-sm text-gray-600">
                      • Storage Area 1<br/>
                      • Loading Dock<br/>
                      • Shipping Department
                    </div>
                    <div>📍 Office Building</div>
                    <div className="ml-4 text-sm text-gray-600">
                      • Administration<br/>
                      • IT Department<br/>
                      • Conference Rooms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
                <CardDescription>Geographic view of your locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Interactive map view coming soon...</p>
                    <p className="text-sm text-gray-400 mt-2">Will show all locations on an interactive map</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
