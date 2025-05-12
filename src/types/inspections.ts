
export type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled';

export type InspectionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface InspectionItem {
  id: string;
  name: string;
  passed: boolean | null;
  notes: string;
}

export interface Inspection {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
  items: InspectionItem[];
}
