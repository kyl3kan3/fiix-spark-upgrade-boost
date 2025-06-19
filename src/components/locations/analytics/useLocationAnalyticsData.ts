
import React from "react";
import { useLocationsQuery, useAssetCountsQuery } from "./locationAnalyticsQueries";
import { calculateLocationAnalytics } from "./locationAnalyticsCalculations";

export const useLocationAnalyticsData = () => {
  const { data: locations = [], isLoading: locationsLoading } = useLocationsQuery();
  const { data: assetCounts = [], isLoading: assetsLoading } = useAssetCountsQuery();

  const isLoading = locationsLoading || assetsLoading;

  // Calculate analytics with proper type checking
  const analytics = React.useMemo(() => {
    if (!Array.isArray(locations) || !Array.isArray(assetCounts)) {
      return null;
    }
    return calculateLocationAnalytics(locations, assetCounts);
  }, [locations, assetCounts]);

  return {
    isLoading,
    analytics
  };
};
