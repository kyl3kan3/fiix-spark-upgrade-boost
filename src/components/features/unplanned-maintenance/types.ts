
export interface UnplannedMaintenanceItem {
  id: string;
  title: string;
  description: string;
  asset: string;
  assetId?: string;
  reportedBy: string;
  reportedAt: Date;
  urgency: "critical" | "high" | "medium" | "low";
  status: "reported" | "in_progress" | "awaiting_parts" | "completed";
  estimatedDowntime?: string;
  actualDowntime?: string;
  assignedTo?: string;
  workOrderId?: string;
  completedAt?: Date;
  notes?: string;
}

export interface UnplannedMaintenanceFormData {
  title: string;
  description: string;
  asset: string;
  urgency: "critical" | "high" | "medium" | "low";
  estimatedDowntime?: string;
  notes?: string;
}
