export interface UnplannedMaintenanceItem {
 id: string;
 title: string;
 description: string;
 asset: string;
 reportedBy: string;
 reportedAt: Date;
 urgency: "critical" | "high" | "medium" | "low";
 status: "reported" | "in_progress" | "completed";
 assignedTo?: string;
 completedAt?: Date;
}

export interface UnplannedMaintenanceFormData {
 title: string;
 description: string;
 assetId: string;
 urgency: "critical" | "high" | "medium" | "low";
 estimatedDowntime?: string;
 notes?: string;
}
