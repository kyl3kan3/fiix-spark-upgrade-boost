
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderFormValues } from "@/components/workOrders/WorkOrderFormSchema";

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
