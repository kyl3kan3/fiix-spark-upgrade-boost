
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useWorkOrderDetails } from "@/components/workOrders/hooks/useWorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Edit, Clipboard } from "lucide-react";
import WorkOrderDetail from "@/components/workOrders/WorkOrderDetail";

const WorkOrderDetailPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  
  const { workOrder, isLoading } = useWorkOrderDetails(workOrderId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!workOrder) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-2">Work Order Not Found</h1>
          <p className="mb-4 text-gray-500">The requested work order could not be found.</p>
          <Button onClick={() => navigate("/work-orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>{workOrder.title} | Work Order | MaintenEase</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/work-orders")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{workOrder.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/work-orders/edit/${workOrder.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(workOrder.id);
              }}
              variant="secondary"
            >
              <Clipboard className="h-4 w-4 mr-2" />
              Copy ID
            </Button>
          </div>
        </div>
        
        <WorkOrderDetail workOrder={workOrder} />
      </div>
    </DashboardLayout>
  );
};

export default WorkOrderDetailPage;
