
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLocationHierarchy, getAllLocations } from "@/services/locationService";

export const useLocationPage = () => {
  const [viewMode, setViewMode] = useState<"hierarchy" | "list" | "analytics" | "bulk">("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch location hierarchy for hierarchy view
  const { data: hierarchyLocations = [], isLoading: isHierarchyLoading, refetch: refetchHierarchy } = useQuery({
    queryKey: ["locationHierarchy"],
    queryFn: getLocationHierarchy,
  });

  // Fetch all locations for list view and form options
  const { data: allLocations = [], isLoading: isAllLocationsLoading, refetch: refetchAll } = useQuery({
    queryKey: ["allLocations"],
    queryFn: getAllLocations,
  });

  const isLoading = viewMode === "hierarchy" ? isHierarchyLoading : isAllLocationsLoading;

  // Filter locations based on search and filters
  const filteredLocations = useMemo(() => {
    let filtered = allLocations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply parent filter
    if (parentFilter !== "all") {
      if (parentFilter === "root") {
        filtered = filtered.filter(location => !location.parent_id);
      } else {
        filtered = filtered.filter(location => location.parent_id === parentFilter);
      }
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(location => {
        const createdDate = new Date(location.created_at);
        
        switch (dateFilter) {
          case "today":
            return createdDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return createdDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return createdDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allLocations, searchQuery, parentFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setParentFilter("all");
    setDateFilter("all");
  };

  const handleImportComplete = () => {
    refetchHierarchy();
    refetchAll();
  };

  const handleOperationComplete = () => {
    refetchHierarchy();
    refetchAll();
  };

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
    allLocations,
    filteredLocations,
    isLoading,
    handleClearFilters,
    handleImportComplete,
    handleOperationComplete,
  };
};
