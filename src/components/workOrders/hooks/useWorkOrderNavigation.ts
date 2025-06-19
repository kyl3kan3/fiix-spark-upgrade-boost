
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { toast } from "sonner";
import { WorkOrderWithRelations } from "@/types/workOrders";

export const useWorkOrderNavigation = () => {
  const navigate = useNavigate();

  const handleCreateWorkOrder = useCallback(() => {
    navigate("/work-orders/new");
  }, [navigate]);

  const handleViewWorkOrder = useCallback((workOrder: WorkOrderWithRelations) => {
    navigate(`/work-orders/${workOrder.id}`);
  }, [navigate]);

  const handleEditWorkOrder = useCallback((workOrder: WorkOrderWithRelations) => {
    navigate(`/work-orders/${workOrder.id}/edit`);
  }, [navigate]);

  const handleDeleteWorkOrder = useCallback(async (workOrderId: string) => {
    if (window.confirm("Are you sure you want to delete this work order?")) {
      try {
        // TODO: Implement delete functionality
        toast.success("Work order deleted successfully");
      } catch (error) {
        toast.error("Failed to delete work order");
      }
    }
  }, []);

  const handleBackToWorkOrders = useCallback(() => {
    navigate("/work-orders");
  }, [navigate]);

  return {
    handleCreateWorkOrder,
    handleViewWorkOrder,
    handleEditWorkOrder,
    handleDeleteWorkOrder,
    handleBackToWorkOrders
  };
};
