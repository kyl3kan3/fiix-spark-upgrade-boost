
import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLocations,
  buildLocationHierarchy,
  searchLocations,
  filterLocationsByParent,
  filterLocationsByDate,
  Location,
  LocationWithChildren
} from "@/services/locationService";

export function useLocationPage() {
  const [viewMode, setViewMode] = useState<"hierarchy" | "list" | "analytics" | "bulk">("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const queryClient = useQueryClient();

  const {
    data: locations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const hierarchyLocations = buildLocationHierarchy(locations);

  const filteredLocations = locations
    .filter(location => !searchQuery || searchLocations([location], searchQuery).length > 0)
    .filter(location => parentFilter === 'all' || location.parent_id === parentFilter)
    .filter(location => {
      if (dateFilter === 'all') return true;
      return filterLocationsByDate([location], dateFilter).length > 0;
    });

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setParentFilter("all");
    setDateFilter("all");
  }, []);

  const handleImportComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['locations'] });
  }, [queryClient]);

  const handleOperationComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['locations'] });
  }, [queryClient]);

  if (error) {
    console.error('Error loading locations:', error);
  }

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    parentFilter,
    setParentFilter,
    dateFilter,
    setDateFilter,
    hierarchyLocations,
    allLocations: locations,
    filteredLocations,
    isLoading,
    handleClearFilters,
    handleImportComplete,
    handleOperationComplete,
  };
}
