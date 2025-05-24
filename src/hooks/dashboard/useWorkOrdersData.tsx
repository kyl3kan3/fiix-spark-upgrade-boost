
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderWithRelations } from "@/types/workOrders";

export function useWorkOrdersData() {
  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ["dashboard-work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          asset:assets(*),
          assignee:profiles!work_orders_assigned_to_fkey(*),
          creator:profiles!work_orders_created_by_fkey(*)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as WorkOrderWithRelations[];
    },
  });

  // Calculate stats
  const stats = {
    total: workOrders?.length || 0,
    open: workOrders?.filter(wo => wo.status === 'pending').length || 0,
    inProgress: workOrders?.filter(wo => wo.status === 'in_progress').length || 0,
    completed: workOrders?.filter(wo => wo.status === 'completed').length || 0,
  };

  return {
    workOrders: workOrders || [],
    stats,
    isLoading,
    error
  };
}
