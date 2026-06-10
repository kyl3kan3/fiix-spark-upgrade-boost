import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Inspection } from "@/types/inspections";
import { checklistIdFromInspectionId } from "@/services/inspectionService";
import {
 addDays,
 endOfMonth,
 endOfWeek,
 format,
 isSameDay,
 isSameMonth,
 startOfMonth,
 startOfWeek,
} from "date-fns";

interface InspectionsCalendarViewProps {
 inspections: Inspection[];
}

const statusDot = (status: string) =>
 status === "completed" ? "bg-success" : "bg-primary";

export const InspectionsCalendarView: React.FC<InspectionsCalendarViewProps> = ({ inspections }) => {
 const navigate = useNavigate();
 const today = new Date();
 const gridStart = startOfWeek(startOfMonth(today), { weekStartsOn: 1 });
 const gridEnd = endOfWeek(endOfMonth(today), { weekStartsOn: 1 });

 const days: Date[] = [];
 for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
 days.push(day);
 }

 const openInspection = (inspection: Inspection) => {
 const checklistId = checklistIdFromInspectionId(inspection.id);
 navigate(checklistId ? `/checklists/${checklistId}/submit` : `/inspections/${inspection.id}`);
 };

 return (
 <Card className="p-4 sm:p-6">
 <h3 className="font-headline text-lg font-semibold text-foreground mb-4">
 {format(today, "MMMM yyyy")}
 </h3>

 <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-1">
 {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
 <div key={d} className="py-1">{d}</div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-1">
 {days.map((day) => {
 const dayInspections = inspections.filter((i) =>
 isSameDay(new Date(i.scheduledDate), day),
 );
 const inMonth = isSameMonth(day, today);
 return (
 <div
 key={day.toISOString()}
 className={`min-h-[84px] rounded-md border p-1.5 text-left ${
 inMonth ? "border-border bg-card" : "border-transparent bg-muted/30"
 } ${isSameDay(day, today) ? "ring-1 ring-primary" : ""}`}
 >
 <div className={`text-xs font-semibold mb-1 ${inMonth ? "text-foreground" : "text-muted-foreground/60"}`}>
 {format(day, "d")}
 </div>
 <div className="space-y-1">
 {dayInspections.slice(0, 3).map((inspection) => (
 <button
 key={inspection.id}
 onClick={() => openInspection(inspection)}
 className="w-full flex items-center gap-1 rounded bg-muted/60 hover:bg-muted px-1 py-0.5 text-left"
 title={inspection.title}
 >
 <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot(inspection.status)}`} />
 <span className="text-[10px] font-medium truncate">{inspection.title}</span>
 </button>
 ))}
 {dayInspections.length > 3 && (
 <div className="text-[10px] text-muted-foreground px-1">
 +{dayInspections.length - 3} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>

 <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
 <span className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-primary" /> Scheduled
 </span>
 <span className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-success" /> Completed
 </span>
 </div>
 </Card>
 );
};
