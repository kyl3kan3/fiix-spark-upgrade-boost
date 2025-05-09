
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkOrderWithRelations } from "@/types/workOrders";

export const useWorkOrders = () => {
  const { toast } = useToast();

  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          asset:assets(*),
          assignee:profiles!work_orders_assigned_to_fkey(*),
          creator:profiles!work_orders_created_by_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WorkOrderWithRelations[];
    },
  });

  if (error) {
    toast({
      title: "Error loading work orders",
      description: (error as Error).message || "An error occurred",
      variant: "destructive"
    });
  }

  return {
    workOrders,
    isLoading,
    error,
    refetch
  };
};
