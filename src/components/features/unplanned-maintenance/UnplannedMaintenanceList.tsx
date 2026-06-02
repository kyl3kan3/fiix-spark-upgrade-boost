
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Wrench, Package, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { UnplannedMaintenanceItem } from "./types";

interface UnplannedMaintenanceListProps {
 items: UnplannedMaintenanceItem[];
 onUpdateStatus: (id: string, status: UnplannedMaintenanceItem['status']) => void;
}

const UnplannedMaintenanceList: React.FC<UnplannedMaintenanceListProps> = ({ 
 items, 
 onUpdateStatus 
}) => {
 const getUrgencyColor = (urgency: string) => {
 switch (urgency) {
 case 'critical':
 return 'bg-destructive/10 text-destructive border-destructive/30';
 case 'high':
 return 'bg-warning/10 text-warning border-warning/30';
 case 'medium':
 return 'bg-warning/10 text-warning border-warning/30';
 case 'low':
 return 'bg-success/10 text-success border-success/30';
 default:
 return 'bg-muted text-foreground border-border';
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'reported':
 return 'bg-primary/10 text-primary';
 case 'in_progress':
 return 'bg-primary/10 text-primary';
 case 'awaiting_parts':
 return 'bg-warning/10 text-warning';
 case 'completed':
 return 'bg-success/10 text-success';
 default:
 return 'bg-muted text-foreground';
 }
 };

 const getStatusActions = (item: UnplannedMaintenanceItem) => {
 switch (item.status) {
 case 'reported':
 return (
 <Button 
 size="sm" 
 onClick={() => onUpdateStatus(item.id, 'in_progress')}
 className="bg-primary hover:bg-primary"
 >
 <Wrench className="mr-1 h-3 w-3" />
 Start Work
 </Button>
 );
 case 'in_progress':
 return (
 <div className="flex gap-2">
 <Button 
 size="sm" 
 variant="outline"
 onClick={() => onUpdateStatus(item.id, 'awaiting_parts')}
 >
 <Package className="mr-1 h-3 w-3" />
 Need Parts
 </Button>
 <Button 
 size="sm" 
 onClick={() => onUpdateStatus(item.id, 'completed')}
 className="bg-success hover:bg-success"
 >
 <CheckCircle className="mr-1 h-3 w-3" />
 Complete
 </Button>
 </div>
 );
 case 'awaiting_parts':
 return (
 <Button 
 size="sm" 
 onClick={() => onUpdateStatus(item.id, 'in_progress')}
 className="bg-primary hover:bg-primary"
 >
 <Wrench className="mr-1 h-3 w-3" />
 Resume Work
 </Button>
 );
 default:
 return null;
 }
 };

 const activeItems = items.filter(item => item.status !== 'completed');
 const completedItems = items.filter(item => item.status === 'completed');

 return (
 <div className="space-y-4">
 {/* Active Items */}
 <div className="space-y-3">
 {activeItems.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
 <p>No active unplanned maintenance issues</p>
 <p className="text-sm">Great job keeping everything running smoothly!</p>
 </div>
 ) : (
 activeItems.map((item) => (
 <Card key={item.id} className="hover:shadow-md transition-shadow">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h3 className="font-semibold text-lg">{item.title}</h3>
 <p className="text-sm text-foreground mt-1">{item.description}</p>
 </div>
 <div className="flex gap-2 ml-4">
 <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
 {item.urgency}
 </Badge>
 <Badge className={getStatusColor(item.status)}>
 {item.status.replace('_', ' ')}
 </Badge>
 </div>
 </div>
 </CardHeader>
 
 <CardContent className="pt-0">
 <div className="space-y-3">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground">
 <div className="flex items-center gap-2">
 <Wrench className="h-4 w-4" />
 <span>Asset: {item.asset}</span>
 </div>
 <div className="flex items-center gap-2">
 <User className="h-4 w-4" />
 <span>Reported by: {item.reportedBy}</span>
 </div>
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4" />
 <span>{format(item.reportedAt, 'MMM dd, HH:mm')}</span>
 </div>
 </div>
 
 {item.estimatedDowntime && (
 <div className="text-sm">
 <span className="font-medium">Estimated Downtime:</span> {item.estimatedDowntime}
 </div>
 )}
 
 {item.assignedTo && (
 <div className="text-sm">
 <span className="font-medium">Assigned to:</span> {item.assignedTo}
 </div>
 )}
 
 <div className="flex justify-end pt-2">
 {getStatusActions(item)}
 </div>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>

 {/* Completed Items Section */}
 {completedItems.length > 0 && (
 <div className="border-t pt-4">
 <h3 className="font-medium text-foreground mb-3">Recently Completed</h3>
 <div className="space-y-2">
 {completedItems.slice(0, 3).map((item) => (
 <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
 <div>
 <p className="font-medium">{item.title}</p>
 <p className="text-sm text-foreground">{item.asset}</p>
 </div>
 <div className="text-right">
 <Badge className={getStatusColor(item.status)}>completed</Badge>
 {item.completedAt && (
 <p className="text-xs text-muted-foreground mt-1">
 {format(item.completedAt, 'MMM dd, HH:mm')}
 </p>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
};

export default UnplannedMaintenanceList;
