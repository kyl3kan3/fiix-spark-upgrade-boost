
export interface MaintenanceEvent {
  id: number;
  title: string;
  description: string;
  date: Date;
  technician: string;
  status: string;
  type: string;
  duration: string;
}
