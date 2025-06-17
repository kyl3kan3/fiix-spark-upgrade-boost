
import { useQuery } from "@tanstack/react-query";
import { getAllLocations } from "@/services/locationService";
import { supabase } from "@/integrations/supabase/client";
import { AssetCount } from "./locationAnalyticsTypes";

export const useLocationsQuery = () => {
  return useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations,
  });
};

export const useAssetCountsQuery = () => {
  return useQuery({
    queryKey: ["locationAssetCounts"],
    queryFn: async (): Promise<AssetCount[]> => {
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
};
