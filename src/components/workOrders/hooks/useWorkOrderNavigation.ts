
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteWorkOrder } from "@/services/workOrderService";
import { WorkOrderWithRelations } from "@/types/workOrders";

export const useWorkOrderNavigation = () => {
 const navigate = useNavigate();
 const queryClient = useQueryClient();

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
 if (!window.confirm("Are you sure you want to delete this work order?")) return;

 try {
 await deleteWorkOrder(workOrderId);
 await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
 await queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
 toast.success("Work order deleted successfully");
 } catch (error) {
 toast.error("Failed to delete work order", {
 description: error instanceof Error ? error.message : "Please try again.",
 });
 }
 }, [queryClient]);

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
