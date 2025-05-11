
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderWithRelations } from "@/types/workOrders";

// Import our new components
import { WorkOrderHeader } from "./components/WorkOrderHeader";
import { WorkOrderStatusBadges } from "./components/WorkOrderStatusBadges";
import { WorkOrderDetailsCard } from "./components/WorkOrderDetailsCard";
import { WorkOrderComments } from "./components/WorkOrderComments";
import { DeleteWorkOrderDialog } from "./components/DeleteWorkOrderDialog";

// Define props interface for the component
interface WorkOrderDetailProps {
  workOrder: WorkOrderWithRelations;
}

// Update component to receive and use the workOrder prop
const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ workOrder }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .delete()
        .eq("id", workOrder.id);

      if (error) throw error;

      toast({
        title: "Work Order Deleted",
        description: "The work order has been successfully deleted."
      });
      
      navigate("/work-orders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the work order",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-6">
        {/* Header with title and actions */}
        <WorkOrderHeader 
          workOrder={workOrder} 
          onDelete={() => setIsDeleteDialogOpen(true)} 
        />
        
        {/* Status badges */}
        <WorkOrderStatusBadges workOrder={workOrder} />
        
        {/* Work Order Details */}
        <WorkOrderDetailsCard workOrder={workOrder} />
        
        {/* Comments Section */}
        <WorkOrderComments workOrder={workOrder} />
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteWorkOrderDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
      />
    </>
  );
};

export default WorkOrderDetail;
