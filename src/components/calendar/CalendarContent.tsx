
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceEvent } from "./types";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";

interface CalendarContentProps {
 date: Date | undefined;
 activeView: string;
 setActiveView: (view: string) => void;
 technicianFilter: string;
 filteredEvents: MaintenanceEvent[];
}

const CalendarContent: React.FC<CalendarContentProps> = ({
 date,
 activeView,
 setActiveView,
 technicianFilter,
 filteredEvents,
}) => {
 return (
 <Card className="w-full bg-card border border-border rounded-lg shadow-sm">
 <CardHeader className="pb-4 px-5 border-b border-border">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="min-w-0 flex-1">
 <CardTitle className="font-headline text-xl text-foreground truncate">
 {date ? format(date, "MMMM d, yyyy") : "Scheduled Events"}
 </CardTitle>
 <CardDescription className="text-sm text-muted-foreground mt-0.5">
 {technicianFilter === "all"
 ? "All technicians"
 : `Technician: ${technicianFilter}`}
 </CardDescription>
 </div>
 <Tabs
 value={activeView}
 onValueChange={setActiveView}
 className="w-full sm:w-auto sm:min-w-[240px]"
 >
 <TabsList className="bg-muted/60 rounded-lg p-1">
 <TabsTrigger value="day" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold">Day</TabsTrigger>
 <TabsTrigger value="week" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold">Week</TabsTrigger>
 <TabsTrigger value="month" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold">Month</TabsTrigger>
 </TabsList>
 </Tabs>
 </div>
 </CardHeader>

 <CardContent className="px-5 pt-5">
 <Tabs value={activeView}>
 <TabsContent value="day" className="mt-0">
 <DayView events={filteredEvents} />
 </TabsContent>

 <TabsContent value="week" className="mt-0">
 <WeekView events={filteredEvents} date={date} />
 </TabsContent>

 <TabsContent value="month" className="mt-0">
 <MonthView events={filteredEvents} />
 </TabsContent>
 </Tabs>
 </CardContent>
 </Card>
 );
};

export default CalendarContent;
