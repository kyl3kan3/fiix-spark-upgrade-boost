
import { Inspection } from "@/types/inspections";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Mock data for demonstration purposes
 */
const mockInspections: Inspection[] = [
  {
    id: "1",
    title: "HVAC System Monthly Check",
    description: "Monthly inspection of the main building HVAC system including filters, belts, and temperature controls.",
    assetId: "asset-001",
    assetName: "Main Building HVAC",
    status: "scheduled",
    priority: "medium",
    assignedTo: "John Doe",
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    items: [
      { id: "item-1", name: "Check air filters", passed: null, notes: "" },
      { id: "item-2", name: "Inspect belt tension", passed: null, notes: "" },
      { id: "item-3", name: "Verify temperature controls", passed: null, notes: "" }
    ]
  },
  {
    id: "2",
    title: "Safety Equipment Inspection",
    description: "Weekly safety inspection of fire extinguishers, emergency exits, and safety signage.",
    assetId: "asset-002",
    assetName: "Building Safety Systems",
    status: "in-progress",
    priority: "high",
    assignedTo: "Sarah Johnson",
    scheduledDate: new Date().toISOString(),
    items: [
      { id: "item-4", name: "Fire extinguisher pressure check", passed: true, notes: "All units within normal range" },
      { id: "item-5", name: "Emergency exit clearance", passed: true, notes: "All exits clear" },
      { id: "item-6", name: "Safety signage visibility", passed: null, notes: "" }
    ]
  },
  {
    id: "3",
    title: "Generator Load Test",
    description: "Quarterly load test of backup generator including fuel levels and automatic transfer switch.",
    assetId: "asset-003",
    assetName: "Backup Generator #2",
    status: "completed",
    priority: "critical",
    assignedTo: "Mike Smith",
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    items: [
      { id: "item-7", name: "Check fuel level", passed: true, notes: "Fuel at 85%" },
      { id: "item-8", name: "Test automatic start", passed: true, notes: "Started within 10 seconds" },
      { id: "item-9", name: "Load test at 75% capacity", passed: true, notes: "Ran for 30 minutes without issues" }
    ]
  }
];

/**
 * Fetches inspections with the given filters
 */
export const fetchInspections = async (filters: any = {}): Promise<{
  data: Inspection[],
  error: Error | null
}> => {
  try {
    // Simulate network delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For now, return mock data
    // In a real app, this would be a Supabase query like:
    // const { data, error } = await supabase
    //   .from('inspections')
    //   .select('*')
    //   .order('scheduled_date', { ascending: false });
    
    return { 
      data: mockInspections,
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
