
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { MaintenanceEvent } from "./types";

interface DayViewProps {
  events: MaintenanceEvent[];
}

const DayView: React.FC<DayViewProps> = ({ events }) => {
  // Status color mapping
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Type color mapping
  const typeColors: Record<string, string> = {
    preventive: "bg-purple-100 text-purple-800 border-purple-200",
    corrective: "bg-orange-100 text-orange-800 border-orange-200",
    inspection: "bg-teal-100 text-teal-800 border-teal-200",
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
        <p className="mt-1 text-sm text-gray-500">
          No maintenance events scheduled for this day.
        </p>
        <div className="mt-6">
          <Button>Schedule New Event</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className={`border-l-4 ${typeColors[event.type].split(' ')[2] || 'border-gray-200'}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription className="mt-1">
                  {event.description}
                </CardDescription>
              </div>
              <Badge className={statusColors[event.status]}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <p className="text-gray-500">Technician</p>
                <p className="font-medium">{event.technician}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">{format(event.date, "h:mm a")}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{event.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{event.duration}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm">View Details</Button>
              <Button size="sm">Update Status</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DayView;
