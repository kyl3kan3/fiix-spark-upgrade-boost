
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkOrderForm from "@/components/workOrders/WorkOrderForm";
import PageHeader from "@/components/shell/PageHeader";
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
        <title>{isEditMode ? "Edit Job" : "Report a Problem"} | MaintenEase</title>
      </Helmet>
      <PageHeader
        title={isEditMode ? "Edit job" : "Report a problem"}
        description={isEditMode
          ? "Update the details for this job."
          : "Tell us what's wrong — we'll get someone on it."}
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        {isEditMode && isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
