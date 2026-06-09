
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UnplannedMaintenanceItem, UnplannedMaintenanceFormData } from "./unplanned-maintenance/types";
import UnplannedMaintenanceForm from "./unplanned-maintenance/UnplannedMaintenanceForm";
import UnplannedMaintenanceList from "./unplanned-maintenance/UnplannedMaintenanceList";
import UnplannedMaintenanceDashboard from "./unplanned-maintenance/UnplannedMaintenanceDashboard";
import {
 createUnplannedWorkOrder,
 getUnplannedWorkOrders,
 updateWorkOrderStatus,
} from "@/services/workOrderService";
import { toast } from "sonner";

const PRIORITY_TO_URGENCY: Record<string, UnplannedMaintenanceItem["urgency"]> = {
 urgent: "critical",
 high: "high",
 medium: "medium",
 low: "low",
};

const ITEM_STATUS_TO_WORK_ORDER = {
 reported: "pending",
 in_progress: "in_progress",
 completed: "completed",
} as const;

const personName = (profile?: { first_name: string | null; last_name: string | null } | null) =>
 [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

const UnplannedMaintenanceContent: React.FC = () => {
 const queryClient = useQueryClient();

 const { data: workOrders, isLoading } = useQuery({
 queryKey: ["unplannedWorkOrders"],
 queryFn: getUnplannedWorkOrders,
 });

 const unplannedItems: UnplannedMaintenanceItem[] = (workOrders || []).map((wo) => ({
 id: wo.id,
 title: wo.title,
 description: wo.description,
 asset: wo.asset?.name || "No asset",
 reportedBy: personName(wo.creator) || "Unknown",
 reportedAt: new Date(wo.created_at),
 urgency: PRIORITY_TO_URGENCY[wo.priority] || "medium",
 status: wo.status === "pending" ? "reported" : wo.status === "cancelled" ? "completed" : wo.status,
 assignedTo: personName(wo.assignee) || undefined,
 completedAt: wo.status === "completed" ? new Date(wo.updated_at) : undefined,
 }));

 const invalidate = () =>
 Promise.all(
 [["unplannedWorkOrders"], ["workOrders"], ["workOrderReportData"], ["recentWorkOrderActivity"], ["dashboard-work-orders"]].map(
 (queryKey) => queryClient.invalidateQueries({ queryKey }),
 ),
 );

 const createRequest = useMutation({
 mutationFn: (formData: UnplannedMaintenanceFormData) =>
 createUnplannedWorkOrder(formData),
 onSuccess: async () => {
 await invalidate();
 toast.success("Unplanned maintenance request created successfully!");
 },
 onError: (error) => {
 toast.error("Couldn't create request", {
 description: error instanceof Error ? error.message : "Please try again.",
 });
 },
 });

 const updateStatus = useMutation({
 mutationFn: ({ id, status }: { id: string; status: UnplannedMaintenanceItem["status"] }) =>
 updateWorkOrderStatus(id, ITEM_STATUS_TO_WORK_ORDER[status]),
 onSuccess: async (_data, { status }) => {
 await invalidate();
 toast.success(`Status updated to ${status.replace("_", " ")}`);
 },
 onError: (error) => {
 toast.error("Couldn't update status", {
 description: error instanceof Error ? error.message : "Please try again.",
 });
 },
 });

 return (
 <div className="space-y-6">
 {/* Dashboard Overview */}
 <UnplannedMaintenanceDashboard items={unplannedItems} />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Unplanned Maintenance List */}
 <Card className="lg:col-span-2">
 <CardHeader>
 <CardTitle className="flex items-center justify-between">
 <span>Active Unplanned Maintenance</span>
 <span className="text-sm font-normal text-muted-foreground">
 {unplannedItems.filter(item => item.status !== 'completed').length} active
 </span>
 </CardTitle>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="py-10 flex items-center justify-center text-muted-foreground">
 <Loader2 className="h-5 w-5 animate-spin mr-2" />
 <span className="text-sm">Loading unplanned maintenance…</span>
 </div>
 ) : (
 <UnplannedMaintenanceList
 items={unplannedItems}
 onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
 />
 )}
 </CardContent>
 </Card>

 {/* Quick Report Form */}
 <Card>
 <CardHeader>
 <CardTitle>Report Unplanned Maintenance</CardTitle>
 </CardHeader>
 <CardContent>
 <UnplannedMaintenanceForm
 onSubmit={(formData) => createRequest.mutate(formData)}
 isSubmitting={createRequest.isPending}
 />
 </CardContent>
 </Card>
 </div>
 </div>
 );
};

export default UnplannedMaintenanceContent;
