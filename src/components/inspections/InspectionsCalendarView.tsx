import React from "react";
import { Card } from "@/components/ui/card";
import { Inspection } from "@/types/inspections";
import { format } from "date-fns";

// Empty array to replace mock data
const inspections: Inspection[] = [];

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
  
  // Map inspections to their days
  const inspectionsByDay: { [key: number]: Inspection[] } = {};
  
  inspections.forEach(inspection => {
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
    switch(status) {
      case 'scheduled':
        return 'border-blue-300 bg-blue-50';
      case 'in-progress':
        return 'border-yellow-300 bg-yellow-50';
      case 'completed':
        return 'border-green-300 bg-green-50';
      case 'failed':
        return 'border-red-300 bg-red-50';
      case 'cancelled':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };
  
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        {format(new Date(currentYear, currentMonth, 1), 'MMMM yyyy')}
      </h2>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentYear, currentMonth, day);
          const dayInspections = inspectionsByDay[day] || [];
          
          return (
            <div 
              key={day} 
              className={`min-h-24 border rounded-md p-1 ${
                date.getDate() === currentDate.getDate() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-right text-sm font-medium mb-1">{day}</div>
              
              <div className="space-y-1">
                {dayInspections.map(inspection => (
                  <div 
                    key={inspection.id} 
                    className={`p-1 text-xs rounded border ${getStatusColor(inspection.status)}`}
                  >
                    <div className="font-medium truncate">{inspection.title}</div>
                    <div className="text-gray-500 truncate">{inspection.assetName}</div>
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
