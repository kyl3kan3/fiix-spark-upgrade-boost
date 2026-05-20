
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Wrench } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";

interface WorkOrderInfoCardProps {
 workOrder: WorkOrderWithRelations;
}

export const WorkOrderInfoCard: React.FC<WorkOrderInfoCardProps> = ({ workOrder }) => {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Wrench className="h-5 w-5" />
 Work Order Information
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-3">
 <User className="h-4 w-4 text-muted-foreground" />
 <div>
 <p className="text-sm font-medium text-muted-foreground">
 Assigned To
 </p>
 <p className="text-foreground">
 {workOrder.assignee 
 ? `${workOrder.assignee.first_name || ''} ${workOrder.assignee.last_name || ''}`.trim()
 : "Unassigned"
 }
 </p>
 </div>
 </div>
 <Separator />
 <div className="flex items-center gap-3">
 <Wrench className="h-4 w-4 text-muted-foreground" />
 <div>
 <p className="text-sm font-medium text-muted-foreground">
 Asset
 </p>
 <p className="text-foreground">
 {workOrder.asset?.name || "No asset assigned"}
 </p>
 {workOrder.asset?.description && (
 <p className="text-sm text-foreground">
 {workOrder.asset.description}
 </p>
 )}
 </div>
 </div>
 <Separator />
 <div className="flex items-center gap-3">
 <User className="h-4 w-4 text-muted-foreground" />
 <div>
 <p className="text-sm font-medium text-muted-foreground">
 Created By
 </p>
 <p className="text-foreground">
 {workOrder.creator 
 ? `${workOrder.creator.first_name || ''} ${workOrder.creator.last_name || ''}`.trim()
 : "Unknown"
 }
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};
