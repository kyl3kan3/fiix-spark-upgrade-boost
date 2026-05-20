
export interface Checklist {
 id: string;
 name: string;
 description?: string;
 type: string;
 frequency: string;
 company_id: string;
 created_by: string;
 created_at: string;
 updated_at: string;
 is_active: boolean;
 items?: ChecklistItem[];
 asset_ids?: string[];
 /** Per-asset stagger: minutes after the checklist's base due time that each asset's prompt activates. */
 asset_offsets?: Record<string, number>;
 schedule?: ChecklistSchedule | null;
}

export interface ChecklistItem {
 id: string;
 checklist_id: string;
 title: string;
 description?: string;
 item_type: 'checkbox' | 'text' | 'number' | 'date';
 is_required: boolean;
 sort_order: number;
 created_at: string;
}

export interface ChecklistSubmission {
 id: string;
 checklist_id: string;
 submitted_by: string;
 submitted_at: string;
 notes?: string;
 status: string;
 checklist?: Checklist;
 items?: ChecklistSubmissionItem[];
}

export interface ChecklistSubmissionItem {
 id: string;
 submission_id: string;
 checklist_item_id: string;
 response_value?: string;
 is_checked?: boolean;
 notes?: string;
 asset_id?: string | null;
 created_at: string;
 checklist_item?: ChecklistItem;
}

export interface ChecklistSchedule {
 id: string;
 checklist_id: string;
 next_due_at: string | null;
 last_submitted_at: string | null;
 created_at: string;
 updated_at: string;
}

export const ChecklistTypes = [
 { value: 'safety', label: 'Safety' },
 { value: 'equipment', label: 'Equipment' },
 { value: 'maintenance', label: 'Maintenance' },
 { value: 'quality', label: 'Quality' },
 { value: 'general', label: 'General' },
] as const;

export const ChecklistFrequencies = [
 { value: 'one-time', label: 'One-time' },
 { value: 'twice-daily', label: 'Twice daily' },
 { value: 'daily', label: 'Daily' },
 { value: 'weekly', label: 'Weekly' },
 { value: 'biweekly', label: 'Biweekly' },
 { value: 'monthly', label: 'Monthly' },
 { value: 'quarterly', label: 'Quarterly' },
 { value: 'annually', label: 'Annually' },
] as const;
