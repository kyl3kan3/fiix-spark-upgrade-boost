
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkOrderForm from "@/components/workOrders/WorkOrderForm";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { getWorkOrderById } from "@/services/workOrderService";
import { Helmet } from "react-helmet";

const WorkOrderFormPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!workOrderId;
  
  const { data: workOrderData, isLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      const { data, error } = await getWorkOrderById(workOrderId);
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  const handleSuccess = () => {
    navigate("/work-orders");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{isEditMode ? "Edit Work Order" : "New Work Order"} | MaintenEase</title>
      </Helmet>
      <BackToDashboard />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Work Order" : "Create Work Order"}
        </h1>
        
        {isEditMode && isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <WorkOrderForm 
            initialData={workOrderData} 
            workOrderId={workOrderId}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkOrderFormPage;
