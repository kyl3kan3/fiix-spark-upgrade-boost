
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MapPin, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { getAllLocations } from "@/services/locationService";
import { supabase } from "@/integrations/supabase/client";

interface LocationAnalyticsProps {
  className?: string;
}

export const LocationAnalytics: React.FC<LocationAnalyticsProps> = ({ className }) => {
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations,
  });

  const { data: assetCounts = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["locationAssetCounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("location_id")
        .not("location_id", "is", null);
      
      if (error) throw error;
      
      // Count assets per location
      const counts = data.reduce((acc: Record<string, number>, asset) => {
        acc[asset.location_id] = (acc[asset.location_id] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(counts).map(([locationId, count]) => ({
        locationId,
        count
      }));
    },
  });

  const isLoading = locationsLoading || assetsLoading;

  // Calculate analytics
  const analytics = React.useMemo(() => {
    if (!locations.length) return null;

    const totalLocations = locations.length;
    const rootLocations = locations.filter(loc => !loc.parent_id).length;
    const emptyLocations = locations.filter(loc => 
      !assetCounts.find(ac => ac.locationId === loc.id)
    ).length;

    // Calculate hierarchy depth
    const getDepth = (locationId: string, visited = new Set()): number => {
      if (visited.has(locationId)) return 0;
      visited.add(locationId);
      
      const children = locations.filter(loc => loc.parent_id === locationId);
      if (children.length === 0) return 1;
      
      return 1 + Math.max(...children.map(child => getDepth(child.id, new Set(visited))));
    };

    const maxDepth = Math.max(...locations.filter(loc => !loc.parent_id).map(loc => getDepth(loc.id)));

    // Asset distribution data for chart
    const assetDistribution = assetCounts
      .map(ac => {
        const location = locations.find(loc => loc.id === ac.locationId);
        return {
          name: location?.name || "Unknown",
          assets: ac.count
        };
      })
      .sort((a, b) => b.assets - a.assets)
      .slice(0, 10); // Top 10 locations

    // Hierarchy distribution
    const hierarchyLevels = locations.reduce((acc: Record<number, number>, loc) => {
      let level = 0;
      let current = loc;
      const visited = new Set();
      
      while (current.parent_id && !visited.has(current.id)) {
        visited.add(current.id);
        level++;
        current = locations.find(l => l.id === current.parent_id) || current;
        if (level > 10) break; // Prevent infinite loops
      }
      
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const hierarchyData = Object.entries(hierarchyLevels).map(([level, count]) => ({
      level: `Level ${level}`,
      count
    }));

    return {
      totalLocations,
      rootLocations,
      emptyLocations,
      maxDepth,
      assetDistribution,
      hierarchyData
    };
  }, [locations, assetCounts]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No location data</h3>
        <p className="mt-1 text-sm text-gray-500">Create some locations to see analytics.</p>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold">{analytics.totalLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Root Locations</p>
                <p className="text-2xl font-bold">{analytics.rootLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empty Locations</p>
                <p className="text-2xl font-bold">{analytics.emptyLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Max Depth</p>
                <p className="text-2xl font-bold">{analytics.maxDepth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.assetDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="assets" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hierarchy Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hierarchy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.hierarchyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.hierarchyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
