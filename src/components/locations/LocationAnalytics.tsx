
import React from "react";
import { LocationAnalyticsCards } from "./analytics/LocationAnalyticsCards";
import { LocationAnalyticsCharts } from "./analytics/LocationAnalyticsCharts";
import { LocationAnalyticsLoading } from "./analytics/LocationAnalyticsLoading";
import { LocationAnalyticsEmpty } from "./analytics/LocationAnalyticsEmpty";
import { useLocationAnalyticsData } from "./analytics/useLocationAnalyticsData";

interface LocationAnalyticsProps {
  className?: string;
}

export const LocationAnalytics: React.FC<LocationAnalyticsProps> = ({ className }) => {
  const { isLoading, analytics } = useLocationAnalyticsData();

  if (isLoading) {
    return <LocationAnalyticsLoading />;
  }

  if (!analytics) {
    return <LocationAnalyticsEmpty className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <LocationAnalyticsCards
        totalLocations={analytics.totalLocations}
        rootLocations={analytics.rootLocations}
        emptyLocations={analytics.emptyLocations}
        maxDepth={analytics.maxDepth}
      />

      {/* Charts */}
      <LocationAnalyticsCharts
        assetDistribution={analytics.assetDistribution}
        hierarchyData={analytics.hierarchyData}
      />
    </div>
  );
};
