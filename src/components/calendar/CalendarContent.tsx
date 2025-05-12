
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
    <Card className="lg:col-span-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>
            {date ? format(date, "MMMM d, yyyy") : "Scheduled Events"}
          </CardTitle>
          <Tabs
            defaultValue="day"
            value={activeView}
            onValueChange={setActiveView}
            className="w-[260px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>
          {technicianFilter === "all"
            ? "All technicians"
            : `Technician: ${technicianFilter}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="day" className="mt-0">
          <DayView events={filteredEvents} />
        </TabsContent>
        
        <TabsContent value="week" className="mt-0">
          <WeekView />
        </TabsContent>
        
        <TabsContent value="month" className="mt-0">
          <MonthView events={filteredEvents} />
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default CalendarContent;
