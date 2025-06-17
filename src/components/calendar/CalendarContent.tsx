
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
    <Card className="w-full">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl truncate">
              {date ? format(date, "MMMM d, yyyy") : "Scheduled Events"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {technicianFilter === "all"
                ? "All technicians"
                : `Technician: ${technicianFilter}`}
            </CardDescription>
          </div>
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-full sm:w-auto sm:min-w-[260px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day" className="text-xs sm:text-sm">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        <Tabs value={activeView}>
          <TabsContent value="day" className="mt-0">
            <DayView events={filteredEvents} />
          </TabsContent>
          
          <TabsContent value="week" className="mt-0">
            <WeekView />
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
