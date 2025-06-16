
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Package, Wrench, Calendar, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getLocationById, getLocationPath } from "@/services/locationService";
import { supabase } from "@/integrations/supabase/client";

const LocationDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: location, isLoading: locationLoading } = useQuery({
    queryKey: ["location", id],
    queryFn: () => getLocationById(id!),
    enabled: !!id,
  });

  const { data: locationPath, isLoading: pathLoading } = useQuery({
    queryKey: ["locationPath", id],
    queryFn: () => getLocationPath(id!),
    enabled: !!id,
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["locationAssets", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("location_id", id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: workOrders = [], isLoading: workOrdersLoading } = useQuery({
    queryKey: ["locationWorkOrders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          assets!inner(location_id)
        `)
        .eq("assets.location_id", id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: subLocations = [], isLoading: subLocationsLoading } = useQuery({
    queryKey: ["subLocations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("parent_id", id)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const isLoading = locationLoading || pathLoading || assetsLoading || workOrdersLoading || subLocationsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!location) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Location not found</h3>
            <Link to="/locations" className="text-primary hover:underline">
              Back to locations
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/locations"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Locations
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{location.name}</h1>
              {locationPath && (
                <p className="text-gray-600 mt-1">
                  <span className="text-sm">Path: </span>
                  {locationPath}
                </p>
              )}
              {location.description && (
                <p className="text-gray-600 mt-2">{location.description}</p>
              )}
            </div>
            
            <Button asChild>
              <Link to={`/locations/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Location
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assets</p>
                  <p className="text-2xl font-bold">{assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Work Orders</p>
                  <p className="text-2xl font-bold">{workOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sub-locations</p>
                  <p className="text-2xl font-bold">{subLocations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-lg font-bold">
                    {new Date(location.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Assets ({assets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <div className="space-y-3">
                  {assets.slice(0, 5).map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.description && (
                          <p className="text-sm text-gray-500">{asset.description}</p>
                        )}
                      </div>
                      <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                        {asset.status}
                      </Badge>
                    </div>
                  ))}
                  {assets.length > 5 && (
                    <Link 
                      to={`/assets?location_id=${id}`}
                      className="block text-center text-primary hover:underline py-2"
                    >
                      View all {assets.length} assets
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No assets in this location</p>
              )}
            </CardContent>
          </Card>

          {/* Sub-locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Sub-locations ({subLocations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subLocations.length > 0 ? (
                <div className="space-y-3">
                  {subLocations.map((subLocation) => (
                    <Link
                      key={subLocation.id}
                      to={`/locations/${subLocation.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <p className="font-medium">{subLocation.name}</p>
                      {subLocation.description && (
                        <p className="text-sm text-gray-500">{subLocation.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No sub-locations</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LocationDetailPage;
