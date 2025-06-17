
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
    <Card className="w-full">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Calendar</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Select a date to view events</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-4">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-2 sm:p-3 pointer-events-auto w-full max-w-sm"
            modifiers={{
              hasEvents: hasEvents,
            }}
            modifiersStyles={{
              hasEvents: {
                fontWeight: 'bold',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
              },
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium block">Filter by Technician</label>
          <Select
            value={technicianFilter}
            onValueChange={setTechnicianFilter}
          >
            <SelectTrigger className="w-full text-xs sm:text-sm">
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.value} className="text-xs sm:text-sm">
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium">Event Types</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-400 mr-2 flex-shrink-0"></span>
              <span className="text-xs sm:text-sm">Preventive</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-orange-400 mr-2 flex-shrink-0"></span>
              <span className="text-xs sm:text-sm">Corrective</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-teal-400 mr-2 flex-shrink-0"></span>
              <span className="text-xs sm:text-sm">Inspection</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
