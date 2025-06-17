
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CalendarContent from "@/components/calendar/CalendarContent";
import DailyLog from "@/components/calendar/DailyLog";
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

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="daily-log">Daily Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-6">
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
        </TabsContent>
        
        <TabsContent value="daily-log" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <CalendarSidebar
              date={date}
              setDate={setDate}
              technicianFilter={technicianFilter}
              setTechnicianFilter={setTechnicianFilter}
              technicians={technicians}
              hasEvents={hasEvents}
            />
            
            <div className="lg:col-span-3">
              {date ? (
                <DailyLog selectedDate={date} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a date to view or create a daily log entry.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CalendarPage;
