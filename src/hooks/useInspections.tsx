
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
    // Don't set loading to true if we already have data (for refreshes)
    if (inspections.length === 0) {
      setLoading(true);
    }
    
    const { data, error } = await fetchInspections(filters);
    
    setInspections(data);
    setError(error);
    setLoading(false);
  }, [filters, inspections.length]);

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
