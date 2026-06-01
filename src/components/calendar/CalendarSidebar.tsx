
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CalendarSidebarProps {
 date: Date | undefined;
 setDate: (date: Date | undefined) => void;
 technicianFilter: string;
 setTechnicianFilter: (filter: string) => void;
 technicians: { id: number; name: string; value: string }[];
 hasEvents: (day: Date) => boolean;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
 date,
 setDate,
 technicianFilter,
 setTechnicianFilter,
 technicians,
 hasEvents,
}) => {
 return (
 <Card className="w-full bg-card border border-border rounded-xl shadow-sm">
 <CardHeader className="pb-3 px-5 border-b border-border">
 <CardTitle className="font-headline text-lg text-foreground">Schedule</CardTitle>
 <CardDescription className="text-xs text-muted-foreground mt-0.5">Select a date to view events</CardDescription>
 </CardHeader>
 <CardContent className="px-4 sm:px-5 pt-4 space-y-5">
 <div className="flex justify-center">
 <Calendar
 mode="single"
 selected={date}
 onSelect={setDate}
 className="rounded-lg pointer-events-auto w-full max-w-sm"
 modifiers={{ hasEvents }}
 modifiersClassNames={{
 hasEvents: "font-bold bg-primary/10 text-primary rounded-md",
 today: "border border-primary bg-primary/5 text-primary rounded-md font-bold",
 selected: "bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary hover:text-primary-foreground",
 }}
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
 Filter by Technician
 </label>
 <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
 <SelectTrigger className="w-full text-sm bg-muted/40 border-border rounded-lg">
 <SelectValue placeholder="Select technician" />
 </SelectTrigger>
 <SelectContent>
 {technicians.map((tech) => (
 <SelectItem key={tech.id} value={tech.value} className="text-sm">
 {tech.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Types</h3>
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
 <span className="text-sm text-foreground">Preventive</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
 <span className="text-sm text-foreground">Corrective</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
 <span className="text-sm text-foreground">Inspection</span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};

export default CalendarSidebar;
