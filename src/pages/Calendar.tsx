
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CalendarContent from "@/components/calendar/CalendarContent";
import DailyLog from "@/components/calendar/DailyLog";
import DailyLogsList from "@/components/calendar/DailyLogsList";
import { useCalendarEvents } from "@/components/calendar/useCalendarEvents";
import QueryErrorState from "@/components/common/QueryErrorState";

const CalendarPage = () => {
 const navigate = useNavigate();
 const [date, setDate] = useState<Date | undefined>(new Date());
 const [activeView, setActiveView] = useState("day");
 const [technicianFilter, setTechnicianFilter] = useState("all");
 const { events, technicians, isLoading, error, refetch } = useCalendarEvents();

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
 navigate("/work-orders/new");
 };

 return (
 <DashboardLayout>
 <PageHeader
 title="PM Scheduler"
 description="Manage and forecast preventive maintenance tasks."
 actions={
 <Button size="lg" onClick={handleScheduleEvent}>
 <CalendarIcon className="h-4 w-4 mr-1.5" />
 Add to Calendar
 </Button>
 }
 />
 <div className="px-4 md:px-6 lg:px-8 py-6">
 <Tabs defaultValue="calendar" className="w-full">
 <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6 gap-0">
 <TabsTrigger
 value="calendar"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground -mb-px"
 >
 Calendar
 </TabsTrigger>
 <TabsTrigger
 value="daily-log"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground -mb-px"
 >
 Today's Notes
 </TabsTrigger>
 <TabsTrigger
 value="logs-list"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground -mb-px"
 >
 All Notes
 </TabsTrigger>
 </TabsList>

 <TabsContent value="calendar" className="mt-0">
 <div className="flex flex-col lg:grid lg:grid-cols-4 gap-5">
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
 {isLoading ? (
 <div className="bg-card border border-border rounded-lg p-12 flex items-center justify-center text-muted-foreground">
 <Loader2 className="h-5 w-5 animate-spin mr-2" />
 <span className="text-sm">Loading scheduled work…</span>
 </div>
 ) : error ? (
 <div className="bg-card border border-border rounded-lg">
 <QueryErrorState title="Couldn't load scheduled work" error={error} onRetry={() => refetch()} />
 </div>
 ) : (
 <CalendarContent
 date={date}
 activeView={activeView}
 setActiveView={setActiveView}
 technicianFilter={technicianFilter}
 filteredEvents={filteredEvents}
 />
 )}
 </div>
 </div>
 </TabsContent>

 <TabsContent value="daily-log" className="mt-0">
 <div className="flex flex-col lg:grid lg:grid-cols-4 gap-5">
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
 <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
 <p className="text-sm">Please select a date to view or create a daily log entry.</p>
 </div>
 )}
 </div>
 </div>
 </TabsContent>

 <TabsContent value="logs-list" className="mt-0">
 <DailyLogsList onViewLog={handleViewLogFromList} />
 </TabsContent>
 </Tabs>
 </div>
 </DashboardLayout>
 );
};

export default CalendarPage;
