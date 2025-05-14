
export interface MaintenanceTask {
  id: number;
  title: string;
  asset: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  frequency?: {
    value: number;
    unit: "days" | "weeks" | "months" | "years";
  };
  lastCompleted?: Date;
  isRecurring: boolean;
}
