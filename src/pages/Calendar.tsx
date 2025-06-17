import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CalendarContent from "@/components/calendar/CalendarContent";
import DailyLog from "@/components/calendar/DailyLog";
import DailyLogsList from "@/components/calendar/DailyLogsList";
import { events, technicians } from "@/components/calendar/mockData";
import { MaintenanceEvent } from "@/components/calendar/types";
import { toast } from "sonner";

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

  const handleViewLogFromList = (logDate: Date) => {
    setDate(logDate);
    // Switch to daily log tab when viewing a log
    const dailyLogTab = document.querySelector('[value="daily-log"]') as HTMLElement;
    if (dailyLogTab) {
      dailyLogTab.click();
    }
  };

  const handleScheduleEvent = () => {
    toast.info("Schedule Event dialog will open here");
  };

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-sm sm:text-base text-gray-500">Schedule and manage maintenance events</p>
        </div>
        <Button onClick={handleScheduleEvent} className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">Calendar View</TabsTrigger>
          <TabsTrigger value="daily-log" className="text-xs sm:text-sm">Daily Log</TabsTrigger>
          <TabsTrigger value="logs-list" className="text-xs sm:text-sm">All Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <CalendarSidebar
                date={date}
                setDate={setDate}
                technicianFilter={technicianFilter}
                setTechnicianFilter={setTechnicianFilter}
                technicians={technicians}
                hasEvents={hasEvents}
              />
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <CalendarContent
                date={date}
                activeView={activeView}
                setActiveView={setActiveView}
                technicianFilter={technicianFilter}
                filteredEvents={filteredEvents}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="daily-log" className="mt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <CalendarSidebar
                date={date}
                setDate={setDate}
                technicianFilter={technicianFilter}
                setTechnicianFilter={setTechnicianFilter}
                technicians={technicians}
                hasEvents={hasEvents}
              />
            </div>
            
            <div className="lg:col-span-3 order-1 lg:order-2">
              {date ? (
                <DailyLog selectedDate={date} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm sm:text-base">Please select a date to view or create a daily log entry.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="logs-list" className="mt-0">
          <DailyLogsList onViewLog={handleViewLogFromList} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CalendarPage;
