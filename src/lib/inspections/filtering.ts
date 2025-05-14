
import { Inspection } from "@/types/inspections";

/**
 * Applies filters to an array of inspections
 */
export function filterInspections(inspections: Inspection[], filters: any = {}): Inspection[] {
  let filteredInspections = [...inspections];
  
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

  return filteredInspections;
}
