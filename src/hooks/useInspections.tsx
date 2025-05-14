
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Inspection } from "@/types/inspections";
import { toast } from "sonner";

export const useInspections = (filters: any = {}) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching inspections...", new Date().toISOString());
      
      // Mock inspections data
      const mockInspections: Inspection[] = [
        {
          id: "1",
          title: "Monthly HVAC Inspection",
          description: "Regular maintenance check of the HVAC system",
          status: "scheduled",
          priority: "medium",
          assignedTo: "John Doe",
          scheduledDate: new Date().toISOString(),
          assetId: "hvac-001",
          assetName: "Main Building HVAC",
          items: [
            { 
              id: "item-1",
              name: "Check filters",
              passed: null,
              notes: ""
            },
            { 
              id: "item-2",
              name: "Inspect coils",
              passed: null,
              notes: ""
            },
            { 
              id: "item-3",
              name: "Test temperature control",
              passed: null,
              notes: ""
            }
          ]
        },
        {
          id: "2",
          title: "Quarterly Electrical Safety Check",
          description: "Comprehensive inspection of all electrical systems",
          status: "in-progress",
          priority: "high",
          assignedTo: "Jane Smith",
          scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          assetId: "elec-002",
          assetName: "Main Electrical Panel",
          items: [
            { 
              id: "item-4",
              name: "Check circuit breakers",
              passed: true,
              notes: "All breakers functioning properly"
            },
            { 
              id: "item-5",
              name: "Inspect wiring",
              passed: false,
              notes: "Found exposed wiring in the server room"
            },
            { 
              id: "item-6",
              name: "Test emergency systems",
              passed: null,
              notes: ""
            }
          ]
        },
        {
          id: "3",
          title: "Annual Fire Safety Inspection",
          description: "Complete review of all fire safety equipment and procedures",
          status: "completed",
          priority: "critical",
          assignedTo: "Robert Johnson",
          scheduledDate: new Date(Date.now() - 604800000).toISOString(), // Last week
          completedDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          assetId: "fire-003",
          assetName: "Building Fire Systems",
          items: [
            { 
              id: "item-7",
              name: "Inspect sprinkler systems",
              passed: true,
              notes: "All systems operational"
            },
            { 
              id: "item-8",
              name: "Check fire extinguishers",
              passed: true,
              notes: "All units properly charged"
            },
            { 
              id: "item-9",
              name: "Test alarms",
              passed: true,
              notes: "All alarms functional"
            }
          ]
        }
      ];

      // Apply filters if any
      let filteredInspections = [...mockInspections];
      
      if (filters.status && filters.status !== 'all') {
        filteredInspections = filteredInspections.filter(
          inspection => inspection.status === filters.status
        );
      }

      if (filters.priority && filters.priority !== 'all') {
        filteredInspections = filteredInspections.filter(
          inspection => inspection.priority === filters.priority
        );
      }

      if (filters.assignedTo && filters.assignedTo !== 'all') {
        filteredInspections = filteredInspections.filter(
          inspection => inspection.assignedTo === filters.assignedTo
        );
      }

      // Date range filtering
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from);
        filteredInspections = filteredInspections.filter(
          inspection => new Date(inspection.scheduledDate) >= fromDate
        );
      }

      if (filters.dateRange?.to) {
        const toDate = new Date(filters.dateRange.to);
        filteredInspections = filteredInspections.filter(
          inspection => new Date(inspection.scheduledDate) <= toDate
        );
      }

      console.log("Fetched and filtered inspections:", filteredInspections);
      setInspections(filteredInspections);
      setError(null);
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Function to force refresh the data
  const refreshInspections = useCallback(() => {
    console.log("Manually triggering inspections refresh");
    setLastRefreshed(Date.now());
  }, []);

  useEffect(() => {
    console.log("useEffect triggered in useInspections, fetching data...");
    fetchInspections();
  }, [fetchInspections, lastRefreshed]);

  return {
    inspections,
    loading,
    error,
    refreshInspections
  };
};
