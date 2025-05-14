
import { useState, useEffect, useCallback } from "react";
import { Inspection } from "@/types/inspections";
import { fetchInspections } from "@/services/inspectionService";

/**
 * Hook for managing inspections data
 */
export const useInspections = (filters: any = {}) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const loadInspections = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await fetchInspections(filters);
    
    setInspections(data);
    setError(error);
    setLoading(false);
  }, [filters]);

  // Function to force refresh the data
  const refreshInspections = useCallback(() => {
    console.log("Manually triggering inspections refresh");
    setLastRefreshed(Date.now());
  }, []);

  useEffect(() => {
    console.log("useEffect triggered in useInspections, fetching data...");
    loadInspections();
  }, [loadInspections, lastRefreshed]);

  return {
    inspections,
    loading,
    error,
    refreshInspections
  };
};
