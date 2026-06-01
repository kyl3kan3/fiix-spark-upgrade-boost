import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useWorkOrderDetails } from "@/components/workOrders/hooks/useWorkOrderDetails";
import { useWorkOrderNavigation } from "@/components/workOrders/hooks/useWorkOrderNavigation";
import { WorkOrderComments } from "@/components/workOrders/components/WorkOrderComments";
import ImageGallery from "@/components/common/ImageGallery";
import { Card, CardContent } from "@/components/ui/card";
import {
  WorkOrderNotificationHistoryCard,
  WorkOrderNotificationHistoryDrawer,
} from "@/components/workOrders/components/WorkOrderNotificationHistory";
import MaterialIcon from "@/components/ui/material-icon";

const WorkOrderDetailPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();

  const { workOrder, isLoading } = useWorkOrderDetails(workOrderId);
  const { handleBackToWorkOrders, handleEditWorkOrder } = useWorkOrderNavigation();

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-container_padding max-w-7xl mx-auto w-full">
          <div className="h-8 w-48 bg-surface-container-high rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-8 space-y-gutter">
              <div className="h-40 bg-surface-container-high rounded-xl animate-pulse" />
              <div className="h-32 bg-surface-container-high rounded-xl animate-pulse" />
              <div className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
            </div>
            <div className="lg:col-span-4 space-y-gutter">
              <div className="h-28 bg-surface-container-high rounded-xl animate-pulse" />
              <div className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
              <div className="h-64 bg-surface-container-high rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ── Not found ── */
  if (!workOrder) {
    return (
      <DashboardLayout>
        <div className="p-container_padding max-w-7xl mx-auto w-full py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center mb-4">
            <MaterialIcon name="assignment_late" className="text-3xl text-on-surface-variant" />
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold mb-2 text-on-surface">
            Work Order Not Found
          </h1>
          <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
            The requested work order could not be found.
          </p>
          <button
            onClick={handleBackToWorkOrders}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md"
          >
            <MaterialIcon name="arrow_back" />
            Back to Work Orders
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const assigneeName = workOrder.assignee
    ? `${workOrder.assignee.first_name ?? ""} ${workOrder.assignee.last_name ?? ""}`.trim()
    : "Unassigned";

  const assigneeInitials = workOrder.assignee
    ? `${workOrder.assignee.first_name?.[0] ?? ""}${workOrder.assignee.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  const priorityBadge =
    workOrder.priority === "urgent" || workOrder.priority === "high"
      ? "bg-error-container text-error"
      : workOrder.priority === "medium"
      ? "bg-surface-container-highest text-primary"
      : "bg-surface-container-high text-on-surface";

  const priorityLabel = workOrder.priority
    ? workOrder.priority.toUpperCase()
    : "NORMAL";

  const statusBadge =
    workOrder.status === "completed"
      ? "bg-surface-container-highest text-[#10B981]"
      : workOrder.status === "in_progress"
      ? "bg-surface-container-highest text-primary"
      : workOrder.status === "cancelled"
      ? "bg-error-container text-error"
      : "bg-surface-container-highest text-on-surface-variant";

  const statusLabel =
    workOrder.status === "in_progress"
      ? "IN PROGRESS"
      : workOrder.status === "completed"
      ? "COMPLETED"
      : workOrder.status === "cancelled"
      ? "CANCELLED"
      : "PENDING";

  const progressPct =
    workOrder.status === "completed" ? 100 : workOrder.status === "in_progress" ? 65 : 10;

  const createdDate = workOrder.created_at
    ? new Date(workOrder.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <DashboardLayout>
      <Helmet>
        <title>{workOrder.title} | Work Order | MaintenEase</title>
      </Helmet>

      {/* Main Content Canvas */}
      <div className="p-container_padding max-w-7xl mx-auto w-full">
        {/* Breadcrumbs & Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-secondary font-label-md mb-2">
              <button
                onClick={handleBackToWorkOrders}
                className="hover:text-primary transition-colors"
              >
                Work Orders
              </button>
              <MaterialIcon name="chevron_right" className="text-[12px]" />
              <span className="text-primary font-bold">
                {workOrder.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">{workOrder.title}</h1>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className={`${priorityBadge} px-3 py-1 rounded-full font-label-md flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {priorityLabel}
              </span>
              <span className={`${statusBadge} px-3 py-1 rounded-full font-label-md`}>
                {statusLabel}
              </span>
              <span className="text-outline-variant font-label-md">Created {createdDate}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleEditWorkOrder(workOrder)}
              className="px-6 py-3 border border-outline-variant text-primary rounded-lg font-label-md uppercase hover:bg-surface-container-low transition-all"
            >
              Edit
            </button>
            <WorkOrderNotificationHistoryDrawer workOrderId={workOrder.id} />
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-label-md uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              Complete Task
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Metadata Card */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <h3 className="font-label-md text-secondary uppercase tracking-widest mb-6">
                Core Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                    <MaterialIcon name="person" />
                  </div>
                  <div>
                    <p className="text-outline text-label-sm uppercase">Requester</p>
                    <p className="font-body-md font-semibold">
                      {workOrder.creator
                        ? `${workOrder.creator.first_name ?? ""} ${workOrder.creator.last_name ?? ""}`.trim() || "—"
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                    <MaterialIcon name="location_on" />
                  </div>
                  <div>
                    <p className="text-outline text-label-sm uppercase">Location</p>
                    <p className="font-body-md font-semibold">
                      {workOrder.asset?.location ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                    <MaterialIcon name="precision_manufacturing" />
                  </div>
                  <div>
                    <p className="text-outline text-label-sm uppercase">Asset</p>
                    <p className="font-body-md font-semibold underline decoration-primary/30">
                      {workOrder.asset?.name ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <h3 className="font-label-md text-secondary uppercase tracking-widest mb-4">
                Detailed Description
              </h3>
              <p className="text-on-surface-variant font-body-lg leading-relaxed">
                {workOrder.description ?? "No description provided."}
              </p>
            </div>

            {/* Photos & Attachments */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <ImageGallery
                entityType="work_order"
                entityId={workOrder.id}
                title="Photos & Attachments"
              />
            </div>

            {/* Notification History */}
            <WorkOrderNotificationHistoryCard workOrderId={workOrder.id} />

            {/* Comments */}
            <Card className="border-outline-variant/20 shadow-sm">
              <CardContent className="p-0">
                <WorkOrderComments workOrder={workOrder} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-gutter">
            {/* Assigned Technician Card */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <h3 className="font-label-md text-secondary uppercase tracking-widest mb-4">
                Assigned To
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm ring-2 ring-primary/10">
                  {assigneeInitials}
                </div>
                <div>
                  <p className="font-body-md font-bold text-primary">{assigneeName}</p>
                  <p className="text-outline text-label-sm">Maintenance Specialist</p>
                </div>
                <button className="ml-auto p-2 bg-surface-container rounded-lg text-primary hover:bg-primary hover:text-white transition-all">
                  <MaterialIcon name="mail" />
                </button>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-md text-secondary uppercase tracking-widest">Progress</h3>
                <span className="text-primary font-bold">{progressPct}%</span>
              </div>
              <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 font-label-md text-on-surface">
                  <MaterialIcon
                    name="check_circle"
                    filled
                    className="text-[#10B981] text-lg"
                  />
                  Initial Inspection
                </li>
                <li className="flex items-center gap-3 font-label-md text-on-surface">
                  <MaterialIcon
                    name="check_circle"
                    filled
                    className="text-[#10B981] text-lg"
                  />
                  Parts Identification
                </li>
                <li className="flex items-center gap-3 font-label-md text-on-surface">
                  <MaterialIcon
                    name="sync"
                    className={`text-primary text-lg ${workOrder.status === "in_progress" ? "animate-spin" : ""}`}
                  />
                  Component Replacement
                </li>
                <li className="flex items-center gap-3 font-label-md text-outline">
                  <MaterialIcon name="radio_button_unchecked" className="text-lg" />
                  System Testing
                </li>
              </ul>
            </div>

            {/* Activity Log */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding shadow-sm border border-transparent hover:border-primary/10 transition-all flex flex-col" style={{ minHeight: "400px" }}>
              <h3 className="font-label-md text-secondary uppercase tracking-widest mb-6">
                Activity Log
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative">
                <div className="absolute left-[11px] top-2 bottom-4 w-px bg-outline-variant/30" />
                {/* Created event */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center z-10">
                    <MaterialIcon name="add_circle" className="text-primary text-[12px]" />
                  </div>
                  <p className="font-label-md font-bold">Work Order Created</p>
                  <p className="text-outline text-[10px] uppercase mt-1">{createdDate}</p>
                </div>
                {/* Status event */}
                {workOrder.status === "in_progress" && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center z-10">
                      <MaterialIcon name="edit" className="text-white text-[12px]" />
                    </div>
                    <p className="font-label-md font-bold">Status set to In Progress</p>
                    <p className="text-outline text-[10px] uppercase mt-1">
                      {workOrder.updated_at
                        ? new Date(workOrder.updated_at).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                )}
                {workOrder.status === "completed" && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center z-10">
                      <MaterialIcon name="check_circle" className="text-[#10B981] text-[12px]" />
                    </div>
                    <p className="font-label-md font-bold">Work Order Completed</p>
                    <p className="text-outline text-[10px] uppercase mt-1">
                      {workOrder.updated_at
                        ? new Date(workOrder.updated_at).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkOrderDetailPage;
