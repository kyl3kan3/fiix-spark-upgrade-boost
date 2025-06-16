
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllLocations } from "@/services/locationService";
import { supabase } from "@/integrations/supabase/client";

export const useLocationAnalyticsData = () => {
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

  return {
    isLoading,
    analytics
  };
};
