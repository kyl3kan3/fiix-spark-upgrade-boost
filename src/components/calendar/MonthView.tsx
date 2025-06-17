
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { MaintenanceEvent } from "./types";

interface MonthViewProps {
  events: MaintenanceEvent[];
}

const MonthView: React.FC<MonthViewProps> = ({ events }) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className={`p-3 sm:p-4 pb-2 ${typeColors[event.type].split(' ')[0]} ${typeColors[event.type].split(' ')[1]}`}>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-sm sm:text-base lg:text-lg line-clamp-2">{event.title}</CardTitle>
              <Badge className={`${statusColors[event.status]} text-xs flex-shrink-0`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="mt-1 font-medium text-xs sm:text-sm">
              {format(event.date, "MMM d, yyyy")} at {format(event.date, "h:mm a")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm mb-3 line-clamp-2">{event.description}</p>
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
              <div className="flex items-center min-w-0">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{event.technician}</span>
              </div>
              <span className="flex-shrink-0">{event.duration}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MonthView;
