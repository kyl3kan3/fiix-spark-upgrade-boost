
import React from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { MaintenanceEvent } from "./types";

interface MonthViewProps {
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

const getTypeAccent = (type: string): { header: string; border: string } => {
 switch (type) {
 case "preventive": return { header: "bg-primary/8 text-primary", border: "border-l-primary" };
 case "corrective": return { header: "bg-warning/8 text-warning", border: "border-l-warning" };
 case "inspection": return { header: "bg-secondary/8 text-secondary", border: "border-l-secondary" };
 default: return { header: "bg-muted text-muted-foreground", border: "border-l-border" };
 }
};

const MonthView: React.FC<MonthViewProps> = ({ events }) => {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
 {events.map((event) => {
 const accent = getTypeAccent(event.type);
 return (
 <div
 key={event.id}
 className={`bg-card border border-border border-l-4 ${accent.border} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all`}
 >
 {/* Header */}
 <div className="p-4 pb-3">
 <div className="flex justify-between items-start gap-2 mb-1.5">
 <h4 className="font-headline text-sm font-semibold text-foreground line-clamp-2 flex-1">
 {event.title}
 </h4>
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0 ${getStatusBadge(event.status)}`}>
 {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
 </span>
 </div>
 <p className="text-xs font-medium text-muted-foreground">
 {format(event.date, "MMM d, yyyy")} · {format(event.date, "h:mm a")}
 </p>
 </div>
 {/* Body */}
 <div className="px-4 pb-4">
 <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
 <div className="flex justify-between items-center text-xs">
 <div className="flex items-center gap-1 min-w-0 text-muted-foreground">
 <Users className="h-3.5 w-3.5 shrink-0" />
 <span className="truncate">{event.technician}</span>
 </div>
 <span className="shrink-0 text-muted-foreground font-medium">{event.duration}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
};

export default MonthView;
