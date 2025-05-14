
import { Inspection } from "@/types/inspections";
import { supabase } from "@/integrations/supabase/client";
import { getMockInspections } from "@/lib/inspections/mockData";
import { filterInspections } from "@/lib/inspections/filtering";
import { toast } from "sonner";

/**
 * Fetches inspections with the given filters
 * Currently returns mock data, but could be updated to fetch from a real database
 */
export const fetchInspections = async (filters: any = {}): Promise<{
  data: Inspection[],
  error: Error | null
}> => {
  try {
    console.log("Fetching inspections...", new Date().toISOString());
    
    // In a real app, this would be an API call or Supabase query
    // For demo purposes, we're using mock data
    const mockData = getMockInspections();
    
    // Apply filters to mock data
    const filteredData = filterInspections(mockData, filters);
    
    console.log(`Fetched ${filteredData.length} inspections after applying filters`);
    
    // Simulate network delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
