
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

  const loadInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchInspections(filters);
      
      if (error) {
        setError(error);
        setInspections([]);
      } else {
        setInspections(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load inspections'));
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Function to force refresh the data
  const refreshInspections = useCallback(() => {
    loadInspections();
  }, [loadInspections]);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  return {
    inspections,
    loading,
    error,
    refreshInspections
  };
};
