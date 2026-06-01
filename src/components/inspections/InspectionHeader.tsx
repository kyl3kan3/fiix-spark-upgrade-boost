
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { InspectionStatus, InspectionPriority } from "@/types/inspections";

interface InspectionHeaderProps {
 id: string;
 title: string;
 status: InspectionStatus;
 priority: InspectionPriority;
 handleBackClick: () => void;
 handleUpdateStatus: (status: InspectionStatus) => void;
}

const InspectionHeader: React.FC<InspectionHeaderProps> = ({
 id,
 title,
 status,
 priority,
 handleBackClick,
 handleUpdateStatus,
}) => {
 const navigate = useNavigate();
 
 const getStatusColor = (status: string) => {
 switch(status) {
 case 'scheduled':
 return 'bg-primary/10 text-primary';
 case 'in-progress':
 return 'bg-warning/10 text-warning';
 case 'completed':
 return 'bg-success/10 text-success';
 case 'failed':
 return 'bg-destructive/10 text-destructive';
 case 'cancelled':
 return 'bg-muted text-foreground';
 default:
 return 'bg-muted text-foreground';
 }
 };

 const getPriorityColor = (priority: string) => {
 switch(priority) {
 case 'low':
 return 'bg-success/10 text-success';
 case 'medium':
 return 'bg-primary/10 text-primary';
 case 'high':
 return 'bg-warning/10 text-warning';
 case 'critical':
 return 'bg-destructive/10 text-destructive';
 default:
 return 'bg-muted text-foreground';
 }
 };

 return (
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <Button variant="ghost" onClick={handleBackClick}>
 <ArrowLeft className="h-4 w-4" />
 </Button>
 <h1 className="text-2xl font-bold">{title}</h1>
 <Badge className={`${getStatusColor(status)}`}>
 {status.replace('-', ' ')}
 </Badge>
 <Badge className={`${getPriorityColor(priority)}`}>
 {priority}
 </Badge>
 </div>
 
 <div className="flex gap-2">
 {status !== 'completed' && (
 <Button 
 variant="outline" 
 className="border-success text-success hover:bg-success/10"
 onClick={() => handleUpdateStatus('completed')}
 >
 <Check className="h-4 w-4 mr-2" />
 Mark Complete
 </Button>
 )}
 <Button onClick={() => navigate(`/inspections/edit/${id}`)}>
 Edit Inspection
 </Button>
 </div>
 </div>
 );
};

export default InspectionHeader;
