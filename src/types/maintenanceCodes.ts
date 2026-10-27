export type MaintenanceCodeType = "failure" | "downtime";

export interface MaintenanceCode {
  id: string;
  company_id: string;
  code_type: MaintenanceCodeType;
  code: string;
  label: string;
  description: string | null;
  created_at: string;
}

export interface MttrSummaryRow {
  failure_code_id: string;
  code: string;
  label: string;
  completed_jobs: number;
  avg_downtime_minutes: number | null;
  total_downtime_minutes: number | null;
}

export interface CreateMaintenanceCodeInput {
  code_type: MaintenanceCodeType;
  code: string;
  label: string;
  description?: string;
}
