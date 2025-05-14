
import { Inspection } from "@/types/inspections";
import { supabase } from "@/integrations/supabase/client";
import { getMockInspections } from "@/lib/inspections/mockData";
import { filterInspections } from "@/lib/inspections/filtering";
import { toast } from "sonner";

/**
 * Fetches inspections with the given filters
 */
export const fetchInspections = async (filters: any = {}): Promise<{
  data: Inspection[],
  error: Error | null
}> => {
  try {
    console.log("Fetching inspections...", new Date().toISOString());
    
    // Get mock data
    const mockData = getMockInspections();
    
    // Apply filters
    const filteredData = filterInspections(mockData, filters);
    
    console.log("Fetched and filtered inspections:", filteredData);
    
    return { 
      data: filteredData,
      error: null
    };
  } catch (err) {
    console.error("Error fetching inspections:", err);
    toast.error("Failed to load inspections");
    return {
      data: [],
      error: err instanceof Error ? err : new Error('Unknown error occurred')
    };
  }
};
