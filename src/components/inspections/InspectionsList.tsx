
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, FileText, User } from "lucide-react";
import { Inspection } from "@/types/inspections";
import { checklistIdFromInspectionId } from "@/services/inspectionService";
import { Skeleton } from "@/components/ui/skeleton";

interface InspectionsListProps {
 inspections: Inspection[];
 loading: boolean;
}

const getStatusBadge = (status: string) => {
 switch (status) {
 case 'scheduled':
 return 'bg-primary/10 text-primary border border-primary/20';
 case 'in-progress':
 return 'bg-warning/10 text-warning border border-warning/20';
 case 'completed':
 return 'bg-success/10 text-success border border-success/20';
 case 'failed':
 return 'bg-destructive/10 text-destructive border border-destructive/20';
 case 'cancelled':
 return 'bg-muted text-muted-foreground border border-border';
 default:
 return 'bg-muted text-muted-foreground border border-border';
 }
};

const getPriorityBadge = (priority: string) => {
 switch (priority) {
 case 'low':
 return 'bg-success/10 text-success border border-success/20';
 case 'medium':
 return 'bg-primary/10 text-primary border border-primary/20';
 case 'high':
 return 'bg-warning/10 text-warning border border-warning/20';
 case 'critical':
 return 'bg-destructive/10 text-destructive border border-destructive/20';
 default:
 return 'bg-muted text-muted-foreground border border-border';
 }
};

const InspectionsList: React.FC<InspectionsListProps> = ({ inspections, loading }) => {
 const navigate = useNavigate();

 if (loading) {
 return (
 <div className="space-y-4">
 {[1, 2, 3].map((index) => (
 <div key={index} className="bg-card border border-border rounded-lg p-6">
 <div className="flex flex-col lg:flex-row lg:items-center gap-6">
 <div className="space-y-2 flex-1">
 <Skeleton className="h-5 w-3/4" />
 <Skeleton className="h-4 w-1/2" />
 </div>
 <div className="flex gap-2">
 <Skeleton className="h-8 w-24 rounded-full" />
 <Skeleton className="h-8 w-20 rounded-full" />
 </div>
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (inspections.length === 0) {
 return (
 <div className="bg-card border border-border rounded-lg shadow-sm text-center py-16">
 <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="font-headline text-lg font-semibold text-foreground mb-2">No inspections found</h3>
 <p className="text-muted-foreground mb-6 text-sm">
 Start by creating your first inspection checklist
 </p>
 <Button onClick={() => navigate("/inspections/new")}>
 <PlusCircle className="mr-2 h-4 w-4" />
 Create New Inspection
 </Button>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {inspections.map((inspection) => (
 <div
 key={inspection.id}
 className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/10 transition-ui cursor-pointer group overflow-hidden"
 onClick={() => navigate(`/inspections/${inspection.id}`)}
 >
 <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
 {/* Title block */}
 <div className="lg:w-1/4">
 <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
 {inspection.title}
 </h3>
 <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
 <FileText className="h-3.5 w-3.5 shrink-0" />
 {inspection.assetName}
 </p>
 </div>

 {/* Meta grid */}
 <div className="grid grid-cols-2 md:grid-cols-3 flex-1 gap-4 items-center">
 <div>
 <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">Scheduled</span>
 <span className="text-sm text-foreground flex items-center gap-1.5">
 <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
 {format(new Date(inspection.scheduledDate), "MMM d, yyyy")}
 </span>
 </div>
 <div>
 <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">Assigned To</span>
 <span className="text-sm text-foreground flex items-center gap-1.5">
 <User className="h-3.5 w-3.5 text-muted-foreground" />
 {inspection.assignedTo}
 </span>
 </div>
 <div className="flex flex-col items-start">
 <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">Status</span>
 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(inspection.status)}`}>
 {inspection.status.replace('-', ' ')}
 </span>
 </div>
 </div>

 {/* Actions */}
 <div className="lg:ml-auto flex items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
 <Button
 size="sm"
 variant="outline"
 className="border-primary text-primary hover:bg-primary/5 text-xs"
 onClick={(e) => { e.stopPropagation(); navigate(`/inspections/${inspection.id}`); }}
 >
 View Details
 </Button>
 {inspection.status !== 'completed' && (
 <Button
 size="sm"
 className="text-xs"
 onClick={(e) => {
 e.stopPropagation();
 const checklistId = checklistIdFromInspectionId(inspection.id);
 navigate(checklistId ? `/checklists/${checklistId}/submit` : `/inspections/${inspection.id}`);
 }}
 >
 Start Now
 </Button>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 );
};

export default InspectionsList;
