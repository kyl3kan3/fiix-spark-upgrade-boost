
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useWorkOrderDetails } from "@/components/workOrders/hooks/useWorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import WorkOrderDetail from "@/components/workOrders/WorkOrderDetail";
import { useWorkOrderNavigation } from "@/components/workOrders/hooks/useWorkOrderNavigation";
import ImageGallery from "@/components/common/ImageGallery";
import { Card, CardContent } from "@/components/ui/card";
import {
 WorkOrderNotificationHistoryCard,
 WorkOrderNotificationHistoryDrawer,
} from "@/components/workOrders/components/WorkOrderNotificationHistory";

const WorkOrderDetailPage: React.FC = () => {
 const { workOrderId } = useParams<{ workOrderId: string }>();
 
 const { workOrder, isLoading } = useWorkOrderDetails(workOrderId);
 const { handleBackToWorkOrders } = useWorkOrderNavigation();

 if (isLoading) {
 return (
 <DashboardLayout>
 <div className="flex justify-center items-center h-60">
 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
 </div>
 </DashboardLayout>
 );
 }

 if (!workOrder) {
 return (
 <DashboardLayout>
 <div className="text-center py-10">
 <h1 className="text-2xl font-bold mb-2">Work Order Not Found</h1>
 <p className="mb-4 text-muted-foreground">The requested work order could not be found.</p>
 <Button onClick={handleBackToWorkOrders}>
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
 <div className="flex items-center justify-between">
 <Button
 variant="ghost"
 size="sm"
 onClick={handleBackToWorkOrders}
 className="-ml-2"
 >
 <ArrowLeft className="h-4 w-4 mr-1" />
 Back to Dashboard
 </Button>
 <WorkOrderNotificationHistoryDrawer workOrderId={workOrder.id} />
 </div>

 <WorkOrderDetail workOrder={workOrder} />

 <Card>
 <CardContent className="p-6">
 <ImageGallery entityType="work_order" entityId={workOrder.id} title="Photos & Attachments" />
 </CardContent>
 </Card>

 <WorkOrderNotificationHistoryCard workOrderId={workOrder.id} />
 </div>
 </DashboardLayout>
 );
};

export default WorkOrderDetailPage;
