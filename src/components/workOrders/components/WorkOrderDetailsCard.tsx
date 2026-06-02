
import React from "react";
import { Calendar, Package, User } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "../utils/dateUtils";

interface WorkOrderDetailsCardProps {
 workOrder: WorkOrderWithRelations;
}

export const WorkOrderDetailsCard: React.FC<WorkOrderDetailsCardProps> = ({ workOrder }) => {
 return (
 <div className="space-y-4">
 {/* Core metadata bento row */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
 <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
 <User className="h-5 w-5 text-primary" />
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Assigned To</p>
 <p className="text-sm font-semibold text-foreground truncate">
 {workOrder.assignee
 ? `${workOrder.assignee.first_name} ${workOrder.assignee.last_name}`
 : "Unassigned"}
 </p>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
 <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
 <Calendar className="h-5 w-5 text-primary" />
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Due Date</p>
 <p className="text-sm font-semibold text-foreground">
 {workOrder.due_date ? formatDate(workOrder.due_date) : "No due date"}
 </p>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
 <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
 <Package className="h-5 w-5 text-primary" />
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Asset</p>
 {workOrder.asset ? (
 <div>
 <p className="text-sm font-semibold text-foreground truncate">{workOrder.asset.name}</p>
 {workOrder.asset.location && (
 <p className="text-xs text-muted-foreground truncate">{workOrder.asset.location}</p>
 )}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No asset linked</p>
 )}
 </div>
 </div>
 </div>

 {/* Description card */}
 {workOrder.description && (
 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-6">
 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Detailed Description</h3>
 <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {workOrder.description}
 </p>
 </div>
 )}

 {/* Creator row */}
 {workOrder.creator && (
 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
 <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
 <User className="h-5 w-5 text-muted-foreground" />
 </div>
 <div>
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Created By</p>
 <p className="text-sm font-semibold text-foreground">
 {workOrder.creator.first_name} {workOrder.creator.last_name}
 </p>
 </div>
 {workOrder.asset?.serial_number && (
 <div className="ml-auto text-right">
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Serial No.</p>
 <p className="text-sm font-mono font-semibold text-foreground">{workOrder.asset.serial_number}</p>
 </div>
 )}
 </div>
 )}
 </div>
 );
};
