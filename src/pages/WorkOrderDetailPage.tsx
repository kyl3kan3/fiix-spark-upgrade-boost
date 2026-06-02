
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
 <div className="px-4 md:px-6 lg:px-8 py-8 space-y-6">
 <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
 <div className="h-20 bg-muted rounded-xl animate-pulse" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2 h-64 bg-muted rounded-xl animate-pulse" />
 <div className="h-64 bg-muted rounded-xl animate-pulse" />
 </div>
 </div>
 </DashboardLayout>
 );
 }

 if (!workOrder) {
 return (
 <DashboardLayout>
 <div className="px-4 md:px-6 lg:px-8 py-16 text-center">
 <div className="mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
 <ArrowLeft className="h-8 w-8 text-muted-foreground" />
 </div>
 <h1 className="font-headline text-2xl font-bold mb-2 text-foreground">Work Order Not Found</h1>
 <p className="mb-6 text-muted-foreground">The requested work order could not be found.</p>
 <Button onClick={handleBackToWorkOrders} className="gap-2">
 <ArrowLeft className="h-4 w-4" />
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

 <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
 {/* Top nav row */}
 <div className="flex items-center justify-between">
 <Button
 variant="ghost"
 size="sm"
 onClick={handleBackToWorkOrders}
 className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
 >
 <ArrowLeft className="h-4 w-4" />
 Work Orders
 </Button>
 <WorkOrderNotificationHistoryDrawer workOrderId={workOrder.id} />
 </div>

 <WorkOrderDetail workOrder={workOrder} />

 <Card className="surface-card">
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
