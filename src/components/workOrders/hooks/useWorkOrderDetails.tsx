
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getWorkOrderById } from "@/services/workOrderService";
import { WorkOrderWithRelations } from "@/types/workOrders";

export const useWorkOrderDetails = (workOrderId?: string) => {
  const { toast } = useToast();

  const { data: workOrder, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      const { data, error } = await getWorkOrderById(workOrderId);
      
      if (error) throw error;
      return data as WorkOrderWithRelations;
    },
    enabled: !!workOrderId,
  });

  if (error) {
    toast({
      title: "Error loading work order",
      description: (error as Error).message || "An error occurred",
      variant: "destructive"
    });
  }

  return {
    workOrder,
    isLoading,
    error,
    refetch
  };
};
