
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
    
    // Start timing for minimum load duration
    const startTime = Date.now();
    
    const { data, error } = await fetchInspections(filters);
    
    // Ensure minimum loading time to prevent flash
    const elapsedTime = Date.now() - startTime;
    const minLoadTime = 500; // 500ms minimum
    
    if (elapsedTime < minLoadTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
    }
    
    setInspections(data);
    setError(error);
    setLoading(false);
  }, [filters]);

  // Function to force refresh the data
  const refreshInspections = useCallback(() => {
    setLastRefreshed(Date.now());
  }, []);

  useEffect(() => {
    loadInspections();
  }, [loadInspections, lastRefreshed]);

  return {
    inspections,
    loading,
    error,
    refreshInspections
  };
};
