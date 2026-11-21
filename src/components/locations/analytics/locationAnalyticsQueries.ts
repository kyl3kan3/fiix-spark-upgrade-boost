
import { useQuery } from "@tanstack/react-query";
import { getAllLocations } from "@/services/locationService";
import { getAssetCountsByLocation } from "@/services/assets/assetQueries";
import type { AssetCount } from "./locationAnalyticsTypes";

export const useLocationsQuery = () => {
 return useQuery({
 queryKey: ["allLocations"],
 queryFn: getAllLocations,
 });
};

export const useAssetCountsQuery = () => {
 return useQuery({
 queryKey: ["locationAssetCounts"],
 queryFn: async (): Promise<AssetCount[]> => getAssetCountsByLocation(),
 });
};
