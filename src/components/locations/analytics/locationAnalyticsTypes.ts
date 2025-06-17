
export interface AssetDistributionData {
  name: string;
  assets: number;
}

export interface HierarchyData {
  level: string;
  count: number;
}

export interface LocationAnalytics {
  totalLocations: number;
  rootLocations: number;
  emptyLocations: number;
  maxDepth: number;
  assetDistribution: AssetDistributionData[];
  hierarchyData: HierarchyData[];
}

export interface AssetCount {
  locationId: string;
  count: number;
}
