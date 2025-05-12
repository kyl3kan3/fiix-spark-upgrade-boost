
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CalendarContent from "@/components/calendar/CalendarContent";
import { events, technicians } from "@/components/calendar/mockData";
import { MaintenanceEvent } from "@/components/calendar/types";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeView, setActiveView] = useState("day");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  
  // Filter events by selected date and technician
  const filteredEvents = events.filter((event) => {
    const isTechnicianMatch = technicianFilter === "all" || event.technician === technicianFilter;
    
    if (activeView === "day" && date) {
      return (
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear() &&
        isTechnicianMatch
      );
    }
    
    return isTechnicianMatch;
  });

  // Function to check if a date has events
  const hasEvents = (day: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-gray-500">Schedule and manage maintenance events</p>
        </div>
        <Button className="bg-maintenease-600 hover:bg-maintenease-700">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CalendarSidebar
          date={date}
          setDate={setDate}
          technicianFilter={technicianFilter}
          setTechnicianFilter={setTechnicianFilter}
          technicians={technicians}
          hasEvents={hasEvents}
        />

        <CalendarContent
          date={date}
          activeView={activeView}
          setActiveView={setActiveView}
          technicianFilter={technicianFilter}
          filteredEvents={filteredEvents}
        />
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
