
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, FileSpreadsheet, FileText } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { formatDate } from "../utils/dateUtils";
import { exportWorkOrderToPdf, exportWorkOrderToCsv, exportWorkOrderToExcel } from "../utils/exportUtils";

interface WorkOrderHeaderProps {
 workOrder: WorkOrderWithRelations;
 onDelete: () => void;
}

export const WorkOrderHeader: React.FC<WorkOrderHeaderProps> = ({ 
 workOrder, 
 onDelete 
}) => {
 const handleExportPdf = () => {
 exportWorkOrderToPdf(workOrder);
 };

 const handleExportCsv = () => {
 exportWorkOrderToCsv(workOrder);
 };
 
 const handleExportExcel = () => {
 exportWorkOrderToExcel(workOrder);
 };

 return (
 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-6">
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
 Work Orders / <span className="text-primary">#{workOrder.id.split('-')[0].toUpperCase()}</span>
 </p>
 <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground leading-snug mb-3 truncate">
 {workOrder.title}
 </h1>
 <p className="text-sm text-muted-foreground">
 Created {formatDate(workOrder.created_at)}
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2 shrink-0">
 <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-1.5 text-xs">
 <Download className="h-3.5 w-3.5" />
 PDF
 </Button>
 <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
 <FileSpreadsheet className="h-3.5 w-3.5" />
 CSV
 </Button>
 <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 text-xs">
 <FileText className="h-3.5 w-3.5" />
 Excel
 </Button>
 <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
 <Link to={`/work-orders/${workOrder.id}/edit`}>
 <Pencil className="h-3.5 w-3.5" />
 Edit
 </Link>
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={onDelete}
 className="gap-1.5 text-xs"
 >
 <Trash2 className="h-3.5 w-3.5" />
 Delete
 </Button>
 </div>
 </div>
 </div>
 );
};
