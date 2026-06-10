
import { add, addMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { requireUser } from "@/services/supabaseHelpers";
import { WorkOrderFormValues } from "@/components/workOrders/WorkOrderFormSchema";
import { WorkOrderStatus } from "@/types/workOrders";

export async function createWorkOrder(userId: string, values: WorkOrderFormValues) {
 const workOrderData = {
 title: values.title,
 description: values.description,
 priority: values.priority,
 status: values.status,
 due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
 asset_id: values.asset_id || null,
 assigned_to: values.assigned_to || null,
 created_by: userId
 };

 const response = await supabase
 .from("work_orders")
 .insert(workOrderData)
 .select();
 
 return response;
}

export async function updateWorkOrder(workOrderId: string, values: WorkOrderFormValues) {
 const workOrderData = {
 title: values.title,
 description: values.description,
 priority: values.priority,
 status: values.status,
 due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
 asset_id: values.asset_id || null,
 assigned_to: values.assigned_to || null
 };

 const response = await supabase
 .from("work_orders")
 .update(workOrderData)
 .eq("id", workOrderId)
 .select();
 
 return response;
}

export async function deleteWorkOrder(workOrderId: string) {
 const { data, error } = await supabase
 .from("work_orders")
 .delete()
 .eq("id", workOrderId)
 .select("id");

 if (error) throw error;
 if (!data || data.length === 0) {
 throw new Error("You don't have permission to delete this work order.");
 }

 return data;
}

export async function getScheduledWorkOrders() {
 const { data, error } = await supabase
 .from("work_orders")
 .select(`
 *,
 asset:assets(*),
 assignee:profiles!work_orders_assigned_to_fkey(*)
 `)
 .not("due_date", "is", null)
 .order("due_date", { ascending: true });

 if (error) throw error;
 return data;
}

export interface PmScheduleInput {
 title: string;
 assetId: string;
 startDate: Date;
 priority: "low" | "medium" | "high";
 frequency?: {
 value: number;
 unit: "days" | "weeks" | "months" | "years";
 };
}

// Without a dedicated schedules table, a recurring schedule is persisted as
// one work order per occurrence, bounded to the next 6 months (max 12).
const PM_HORIZON_MONTHS = 6;
const PM_MAX_OCCURRENCES = 12;

export function buildPmOccurrenceDates(
 startDate: Date,
 frequency?: PmScheduleInput["frequency"],
): Date[] {
 if (!frequency || frequency.value < 1) return [startDate];

 const horizon = addMonths(startDate, PM_HORIZON_MONTHS);
 const dates: Date[] = [];
 let next = startDate;
 while (next <= horizon && dates.length < PM_MAX_OCCURRENCES) {
 dates.push(next);
 next = add(next, { [frequency.unit]: frequency.value });
 }
 return dates;
}

export async function createPmSchedule(input: PmScheduleInput) {
 const user = await requireUser();
 const dates = buildPmOccurrenceDates(input.startDate, input.frequency);

 const description = input.frequency
 ? `Preventive maintenance — repeats every ${input.frequency.value} ${input.frequency.unit}`
 : "Preventive maintenance";

 const rows = dates.map((date) => ({
 title: input.title,
 description,
 priority: input.priority,
 status: "pending" as const,
 due_date: date.toISOString(),
 asset_id: input.assetId,
 created_by: user.id,
 }));

 const { data, error } = await supabase
 .from("work_orders")
 .insert(rows)
 .select("id");

 if (error) throw error;
 return data?.length ?? 0;
}

export async function getUpcomingPmWorkOrders() {
 const { data, error } = await supabase
 .from("work_orders")
 .select("id, title, due_date, priority, status, description, asset:assets(name)")
 .not("due_date", "is", null)
 .in("status", ["pending", "in_progress"])
 .order("due_date", { ascending: true });

 if (error) throw error;
 return data || [];
}

export async function updateWorkOrderStatus(workOrderId: string, status: WorkOrderStatus) {
 const { data, error } = await supabase
 .from("work_orders")
 .update({ status })
 .eq("id", workOrderId)
 .select("id");

 if (error) throw error;
 if (!data || data.length === 0) {
 throw new Error("You don't have permission to update this work order.");
 }
 return data;
}

export async function completeWorkOrder(workOrderId: string) {
 return updateWorkOrderStatus(workOrderId, "completed");
}

export type UnplannedUrgency = "critical" | "high" | "medium" | "low";

export interface UnplannedWorkOrderInput {
 title: string;
 description: string;
 assetId: string;
 urgency: UnplannedUrgency;
 estimatedDowntime?: string;
 notes?: string;
}

const URGENCY_TO_PRIORITY = {
 critical: "urgent",
 high: "high",
 medium: "medium",
 low: "low",
} as const;

export function buildUnplannedDescription(input: UnplannedWorkOrderInput): string {
 const parts = [input.description];
 if (input.estimatedDowntime) parts.push(`Estimated downtime: ${input.estimatedDowntime}`);
 if (input.notes) parts.push(`Notes: ${input.notes}`);
 return parts.join("\n\n");
}

// Unscheduled work (no due_date) is the reactive/unplanned bucket; scheduled
// PM work always carries a due date.
export async function createUnplannedWorkOrder(input: UnplannedWorkOrderInput) {
 const user = await requireUser();

 const { data, error } = await supabase
 .from("work_orders")
 .insert({
 title: input.title,
 description: buildUnplannedDescription(input),
 priority: URGENCY_TO_PRIORITY[input.urgency],
 status: "pending" as const,
 due_date: null,
 asset_id: input.assetId,
 created_by: user.id,
 })
 .select("id");

 if (error) throw error;
 return data;
}

export async function getUnplannedWorkOrders() {
 const { data, error } = await supabase
 .from("work_orders")
 .select(`
 id, title, description, status, priority, created_at, updated_at,
 asset:assets(name),
 assignee:profiles!work_orders_assigned_to_fkey(first_name, last_name),
 creator:profiles!work_orders_created_by_fkey(first_name, last_name)
 `)
 .is("due_date", null)
 .order("created_at", { ascending: false });

 if (error) throw error;
 return data || [];
}

export async function getWorkOrderById(workOrderId: string) {
 const response = await supabase
 .from("work_orders")
 .select(`
 *,
 asset:assets(*),
 assignee:profiles!work_orders_assigned_to_fkey(*),
 creator:profiles!work_orders_created_by_fkey(*)
 `)
 .eq("id", workOrderId)
 .single();
 
 return response;
}
