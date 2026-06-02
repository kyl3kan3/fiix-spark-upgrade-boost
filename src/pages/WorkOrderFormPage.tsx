
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkOrderForm from "@/components/workOrders/WorkOrderForm";
import PageHeader from "@/components/shell/PageHeader";
import { getWorkOrderById } from "@/services/workOrderService";
import { Helmet } from "react-helmet-async";

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
 <title>{isEditMode ? "Edit Job" : "Create New Work Order"} | MaintenEase</title>
 </Helmet>
 <PageHeader
 title={isEditMode ? "Edit Work Order" : "Create New Work Order"}
 description={isEditMode
 ? "Update the details for this maintenance task."
 : "Initiate a new maintenance task. Provide detailed information so the technician can resolve the issue efficiently."}
 />
 <div className="px-4 md:px-6 lg:px-8 py-6 max-w-4xl">
 {isEditMode && isLoading ? (
 <div className="space-y-4">
 <div className="h-48 bg-muted rounded-xl animate-pulse" />
 <div className="h-36 bg-muted rounded-xl animate-pulse" />
 <div className="h-24 bg-muted rounded-xl animate-pulse" />
 </div>
 ) : (
 <WorkOrderForm
 initialData={workOrderData ?? undefined}
 workOrderId={workOrderId}
 onSuccess={handleSuccess}
 />
 )}
 </div>
 </DashboardLayout>
 );
};

export default WorkOrderFormPage;
