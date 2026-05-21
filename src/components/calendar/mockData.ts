import type { MaintenanceEvent } from "./types";

// Data will be populated from database
export const events: MaintenanceEvent[] = [];

export const technicians = [
 { id: 1, name: "All Technicians", value: "all" }
 // Additional technicians will be populated from database
];
