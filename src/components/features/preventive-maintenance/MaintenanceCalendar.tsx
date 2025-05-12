
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MaintenanceCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  currentMonthTaskDays: number[];
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({ 
  selectedDate, 
  setSelectedDate, 
  currentMonthTaskDays 
}) => {
  return (
    <div className="mb-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className={cn("rounded-md border pointer-events-auto")}
        modifiers={{
          hasTask: (date) => 
            currentMonthTaskDays.includes(date.getDate()) && 
            date.getMonth() === new Date().getMonth()
        }}
        modifiersStyles={{
          hasTask: { backgroundColor: "#e5deff", fontWeight: "bold" }
        }}
      />
    </div>
  );
};

export default MaintenanceCalendar;
