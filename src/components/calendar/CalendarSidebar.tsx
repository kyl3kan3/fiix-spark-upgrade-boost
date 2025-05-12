
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
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Select a date to view events</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border p-3 pointer-events-auto"
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

        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Filter by Technician</label>
          <Select
            value={technicianFilter}
            onValueChange={setTechnicianFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.value}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Event Types</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
              <span className="text-sm">Preventive</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
              <span className="text-sm">Corrective</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-teal-400 mr-2"></span>
              <span className="text-sm">Inspection</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
