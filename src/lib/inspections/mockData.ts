
import { Inspection } from "@/types/inspections";

/**
 * Provides mock data for inspections
 */
export function getMockInspections(): Inspection[] {
  return [
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
}
