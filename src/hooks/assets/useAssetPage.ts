
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAssets,
  buildAssetHierarchy,
  searchAssets,
  filterAssetsByLocation,
  filterAssetsByStatus,
  Asset,
  AssetWithChildren
} from "@/services/assetService";

export function useAssetPage() {
  const [viewMode, setViewMode] = useState<"hierarchy" | "grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const {
    data: assets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const hierarchyAssets = buildAssetHierarchy(assets);

  const filteredAssets = assets
    .filter(asset => !searchQuery || searchAssets([asset], searchQuery).length > 0)
    .filter(asset => locationFilter === 'all' || asset.location_id === locationFilter)
    .filter(asset => statusFilter === 'all' || asset.status === statusFilter);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setLocationFilter("all");
    setStatusFilter("all");
  }, []);

  const handleOperationComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['assets'] });
  }, [queryClient]);

  if (error) {
    console.error('Error loading assets:', error);
  }

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    statusFilter,
    setStatusFilter,
    hierarchyAssets,
    allAssets: assets,
    filteredAssets,
    isLoading,
    handleClearFilters,
    handleOperationComplete,
  };
}
