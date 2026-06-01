
import React from "react";
import { Card } from "@/components/ui/card";
import { Inspection } from "@/types/inspections";
import { format } from "date-fns";

interface InspectionsCalendarViewProps {
 filters: {
 status: string;
 priority: string;
 assignedTo: string;
 dateRange: { from: Date | undefined; to: Date | undefined };
 };
}

export const InspectionsCalendarView: React.FC<InspectionsCalendarViewProps> = ({ filters }) => {
 // Simple calendar view - in a real app you'd use a more sophisticated calendar component
 const daysInMonth = 31; // Simplified for demo
 const currentDate = new Date();
 const currentMonth = currentDate.getMonth();
 const currentYear = currentDate.getFullYear();
 
 // Mock inspections for calendar display
 const mockInspections: Inspection[] = [
 {
 id: "1",
 title: "HVAC Inspection",
 description: "Regular check",
 status: "scheduled",
 priority: "medium",
 assignedTo: "John Doe",
 scheduledDate: new Date(currentYear, currentMonth, 15).toISOString(),
 assetId: "hvac-001",
 assetName: "HVAC System",
 items: []
 },
 {
 id: "2",
 title: "Electrical Check",
 description: "Safety inspection",
 status: "in-progress",
 priority: "high",
 assignedTo: "Jane Smith",
 scheduledDate: new Date(currentYear, currentMonth, 10).toISOString(),
 assetId: "elec-002",
 assetName: "Main Panel",
 items: []
 },
 {
 id: "3",
 title: "Fire Safety",
 description: "Annual review",
 status: "completed",
 priority: "critical",
 assignedTo: "Robert Johnson",
 scheduledDate: new Date(currentYear, currentMonth, 5).toISOString(),
 assetId: "fire-003",
 assetName: "Fire Systems",
 items: []
 }
 ];
 
 // Map inspections to their days
 const inspectionsByDay: { [key: number]: Inspection[] } = {};
 
 mockInspections.forEach(inspection => {
 const date = new Date(inspection.scheduledDate);
 const day = date.getDate();
 if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
 if (!inspectionsByDay[day]) {
 inspectionsByDay[day] = [];
 }
 inspectionsByDay[day].push(inspection);
 }
 });

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'scheduled': return 'border-primary/30 bg-primary/8 text-primary';
 case 'in-progress': return 'border-warning/30 bg-warning/8 text-warning';
 case 'completed': return 'border-success/30 bg-success/8 text-success';
 case 'failed': return 'border-destructive/30 bg-destructive/8 text-destructive';
 case 'cancelled': return 'border-border bg-muted text-muted-foreground';
 default: return 'border-border bg-muted text-muted-foreground';
 }
 };

 return (
 <Card className="bg-card border border-border rounded-xl shadow-sm p-5">
 <h2 className="font-headline text-xl font-semibold text-foreground mb-5">
 {format(new Date(currentYear, currentMonth, 1), 'MMMM yyyy')}
 </h2>

 <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-3">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="text-center">
 <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sm:hidden">{day.charAt(0)}</span>
 <span className="hidden sm:inline text-xs font-semibold text-muted-foreground uppercase tracking-wider">{day}</span>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
 {Array.from({ length: daysInMonth }, (_, i) => {
 const day = i + 1;
 const date = new Date(currentYear, currentMonth, day);
 const dayInspections = inspectionsByDay[day] || [];
 const isToday = date.getDate() === currentDate.getDate() &&
 date.getMonth() === currentDate.getMonth() &&
 date.getFullYear() === currentDate.getFullYear();

 return (
 <div
 key={day}
 className={`min-h-14 sm:min-h-20 border rounded-lg p-0.5 sm:p-1 text-[10px] sm:text-xs hover:border-primary/30 transition-colors ${
 isToday
 ? 'border-primary bg-primary/5'
 : 'border-border/60 hover:bg-muted/30'
 }`}
 >
 <div className={`text-right text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
 {day}
 </div>
 <div className="space-y-0.5">
 {dayInspections.map(inspection => (
 <div
 key={inspection.id}
 className={`p-0.5 sm:p-1 text-[9px] sm:text-xs rounded border ${getStatusColor(inspection.status)}`}
 >
 <div className="font-semibold truncate">{inspection.title}</div>
 <div className="truncate opacity-70">{inspection.assetName}</div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 );
};
