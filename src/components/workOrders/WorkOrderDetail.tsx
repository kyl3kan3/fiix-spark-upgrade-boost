
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const handleDelete = async () => {
 if (isDeleting) return;
 setIsDeleting(true);
 try {
 const { data, error } = await supabase
 .from("work_orders")
 .delete()
 .eq("id", workOrder.id)
 .select("id");

 if (error) throw error;
 if (!data || data.length === 0) {
 throw new Error("You don't have permission to delete this job.");
 }

 toast.success("Job deleted", {
 description: "The work order has been removed.",
 });
 setIsDeleteDialogOpen(false);
 navigate("/work-orders");
 } catch (error: any) {
 toast.error("Couldn't delete job", {
 description: error.message || "Please try again.",
 });
 } finally {
 setIsDeleting(false);
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
 onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
 onDelete={handleDelete}
 isDeleting={isDeleting}
 />
 </>
 );
};

export default WorkOrderDetail;
