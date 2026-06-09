
import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { MaintenanceEvent } from "./types";

interface DayViewProps {
 events: MaintenanceEvent[];
}

const getStatusBadge = (status: string) => {
 switch (status) {
 case "scheduled": return "bg-primary/10 text-primary border border-primary/20";
 case "in-progress": return "bg-warning/10 text-warning border border-warning/20";
 case "completed": return "bg-success/10 text-success border border-success/20";
 case "cancelled": return "bg-destructive/10 text-destructive border border-destructive/20";
 default: return "bg-muted text-muted-foreground border border-border";
 }
};

const getTypeBorderAccent = (type: string) => {
 switch (type) {
 case "preventive": return "border-l-primary";
 case "corrective": return "border-l-warning";
 case "inspection": return "border-l-secondary";
 default: return "border-l-border";
 }
};

const DayView: React.FC<DayViewProps> = ({ events }) => {
 const navigate = useNavigate();

 if (events.length === 0) {
 return (
 <div className="text-center py-12">
 <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
 <h3 className="font-headline text-base font-semibold text-foreground mb-1">No events scheduled</h3>
 <p className="text-sm text-muted-foreground mb-5">
 No maintenance events scheduled for this day.
 </p>
 <Button size="sm" onClick={() => navigate("/work-orders/new")}>Schedule New Event</Button>
 </div>
 );
 }

 return (
 <div className="space-y-3">
 {events.map((event) => (
 <div key={event.id} className={`bg-card border border-border border-l-4 ${getTypeBorderAccent(event.type)} rounded-lg p-5 hover:shadow-md transition-shadow`}>
 <div className="flex items-start justify-between mb-3">
 <div>
 <h4 className="font-headline text-base font-semibold text-foreground">{event.title}</h4>
 <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
 </div>
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase shrink-0 ${getStatusBadge(event.status)}`}>
 {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Technician</p>
 <p className="font-medium text-foreground">{event.technician}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Time</p>
 <p className="font-medium text-foreground">{format(event.date, "h:mm a")}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Type</p>
 <p className="font-medium text-foreground capitalize">{event.type}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Asset</p>
 <p className="font-medium text-foreground">{event.asset}</p>
 </div>
 </div>
 <div className="mt-4 flex justify-end gap-2">
 <Button
 variant="outline"
 size="sm"
 className="text-xs border-primary text-primary hover:bg-primary/5"
 onClick={() => navigate(`/work-orders/${event.id}`)}
 >
 View Details
 </Button>
 </div>
 </div>
 ))}
 </div>
 );
};

export default DayView;
