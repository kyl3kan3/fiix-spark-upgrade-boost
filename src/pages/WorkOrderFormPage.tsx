import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkOrderForm from "@/components/workOrders/WorkOrderForm";
import { getWorkOrderById } from "@/services/workOrderService";
import MaterialIcon from "@/components/ui/material-icon";

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

      {/* Main Content Area */}
      <main className="px-container_padding py-gutter max-w-5xl mx-auto w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-secondary text-label-sm font-label-sm">
          <button
            onClick={() => navigate("/work-orders")}
            className="hover:text-primary transition-colors"
          >
            Work Orders
          </button>
          <MaterialIcon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-bold">
            {isEditMode ? "Edit Work Order" : "New Work Order"}
          </span>
        </nav>

        {/* Page Header */}
        <header className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
            {isEditMode ? "Edit Work Order" : "Create New Work Order"}
          </h1>
          <p className="text-secondary max-w-2xl font-body-md text-body-md">
            {isEditMode
              ? "Update the details for this maintenance task."
              : "Initiate a new maintenance task. Please provide detailed information to ensure the technician can resolve the issue efficiently."}
          </p>
        </header>

        {/* Form Container */}
        <div className="space-y-gutter">
          {isEditMode && isLoading ? (
            <div className="space-y-gutter">
              {/* Section skeleton cards */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-transparent p-card_padding">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-surface-container-high animate-pulse" />
                  <div className="h-6 w-48 bg-surface-container-high rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-surface-container-high rounded-lg animate-pulse" />
                  <div className="h-24 bg-surface-container-high rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-transparent p-card_padding">
                <div className="h-6 w-48 bg-surface-container-high rounded animate-pulse mb-6" />
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-12 bg-surface-container-high rounded-lg animate-pulse" />
                  <div className="h-12 bg-surface-container-high rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/*
                The WorkOrderForm component renders the actual form sections.
                It is a complete form with all the fields and handles submission.
                The outer container provides the bento-card visual style from the mockup.
              */}
              <WorkOrderForm
                initialData={workOrderData ?? undefined}
                workOrderId={workOrderId}
                onSuccess={handleSuccess}
              />
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default WorkOrderFormPage;
