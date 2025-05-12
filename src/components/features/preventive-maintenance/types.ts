
export interface MaintenanceTask {
  id: number;
  title: string;
  asset: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
}
