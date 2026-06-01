
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CalendarContent from "@/components/calendar/CalendarContent";
import DailyLog from "@/components/calendar/DailyLog";
import DailyLogsList from "@/components/calendar/DailyLogsList";
import { events, technicians } from "@/components/calendar/mockData";
import { MaintenanceEvent } from "@/components/calendar/types";
import { toast } from "sonner";
import { MaterialIcon } from "@/components/ui/material-icon";

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
   const dailyLogTab = document.querySelector('[value="daily-log"]') as HTMLElement;
   if (dailyLogTab) {
     dailyLogTab.click();
   }
 };

 const handleScheduleEvent = () => {
   toast.info("Schedule Event dialog will open here");
 };

 const now = new Date();
 const monthYear = now.toLocaleString("default", { month: "long", year: "numeric" });

 return (
   <DashboardLayout>
     <Helmet>
       <title>PM Scheduler | MaintenEase</title>
       <meta name="description" content="Manage and forecast preventive maintenance tasks." />
       <link rel="canonical" href="https://maintenease.com/calendar" />
     </Helmet>

     {/* Scrollable Workspace */}
     <div className="flex-1 overflow-y-auto overflow-x-hidden p-container_padding bg-background">
       {/* Page Header */}
       <div className="flex justify-between items-end mb-8">
         <div>
           <h1 className="font-display-lg text-display-lg text-on-surface mb-2">PM Scheduler</h1>
           <p className="font-body-lg text-body-lg text-on-surface-variant">Manage and forecast preventive maintenance tasks.</p>
         </div>
         <button
           onClick={handleScheduleEvent}
           className="bg-primary-container text-on-primary-container hover:shadow-[0_4px_14px_0_rgba(30,64,175,0.39)] transition-all duration-300 px-6 py-3 rounded-lg font-label-md text-label-md flex items-center group active:scale-95"
         >
           <MaterialIcon name="calendar_add_on" className="mr-2 transition-transform group-hover:rotate-90" />
           Create New Schedule
         </button>
       </div>

       {/* Dashboard Grid */}
       <div className="grid grid-cols-12 gap-gutter">
         {/* Main Calendar View (Spans 8 cols) */}
         <div className="col-span-12 lg:col-span-8 space-y-gutter">
           {/* Calendar Controls */}
           <div className="bg-surface-container-lowest rounded-xl deep-shadow p-4 flex items-center justify-between border border-transparent">
             <div className="flex items-center space-x-4">
               <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
                 <MaterialIcon name="chevron_left" />
               </button>
               <h3 className="font-headline-md text-headline-md text-on-surface">{monthYear}</h3>
               <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
                 <MaterialIcon name="chevron_right" />
               </button>
             </div>
             <div className="flex bg-surface-container-low rounded-lg p-1">
               {["Week", "Month", "Year"].map((v) => (
                 <button
                   key={v}
                   className={`px-4 py-1.5 rounded-md font-label-sm text-label-sm transition-all ${
                     v === "Month"
                       ? "bg-surface-container-lowest shadow-sm text-primary font-bold"
                       : "text-on-surface-variant hover:text-on-surface"
                   }`}
                 >
                   {v}
                 </button>
               ))}
             </div>
           </div>

           {/* Calendar Tabs — existing data-driven content */}
           <Tabs defaultValue="calendar" className="w-full">
             <TabsList className="bg-transparent border-b border-outline-variant/10 w-full justify-start rounded-none h-auto p-0 mb-4 gap-0">
               <TabsTrigger
                 value="calendar"
                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-on-surface data-[state=active]:shadow-none px-4 py-3 text-label-md font-label-md text-on-surface-variant hover:text-on-surface -mb-px"
               >
                 Calendar
               </TabsTrigger>
               <TabsTrigger
                 value="daily-log"
                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-on-surface data-[state=active]:shadow-none px-4 py-3 text-label-md font-label-md text-on-surface-variant hover:text-on-surface -mb-px"
               >
                 Today's Notes
               </TabsTrigger>
               <TabsTrigger
                 value="logs-list"
                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-on-surface data-[state=active]:shadow-none px-4 py-3 text-label-md font-label-md text-on-surface-variant hover:text-on-surface -mb-px"
               >
                 All Notes
               </TabsTrigger>
             </TabsList>

             <TabsContent value="calendar" className="mt-0">
               <CalendarContent
                 date={date}
                 activeView={activeView}
                 setActiveView={setActiveView}
                 technicianFilter={technicianFilter}
                 filteredEvents={filteredEvents}
               />
             </TabsContent>

             <TabsContent value="daily-log" className="mt-0">
               {date ? (
                 <DailyLog selectedDate={date} />
               ) : (
                 <div className="bg-surface-container-lowest rounded-xl deep-shadow p-12 text-center text-on-surface-variant border border-transparent">
                   <p className="font-body-md text-body-md">Please select a date to view or create a daily log entry.</p>
                 </div>
               )}
             </TabsContent>

             <TabsContent value="logs-list" className="mt-0">
               <DailyLogsList onViewLog={handleViewLogFromList} />
             </TabsContent>
           </Tabs>
         </div>

         {/* Side Panel (Spans 4 cols) */}
         <div className="col-span-12 lg:col-span-4 space-y-gutter flex flex-col h-full">
           {/* PM Health Summary */}
           <div className="bg-surface-container-lowest rounded-xl deep-shadow p-card_padding border border-transparent">
             <h3 className="font-headline-md text-headline-md text-on-surface mb-6 font-bold tracking-tight">Schedule Health</h3>
             <div className="flex items-center justify-between mb-6">
               <div className="relative w-24 h-24 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-primary/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                   <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeLinecap="round" strokeWidth="3"></path>
                 </svg>
                 <div className="absolute flex flex-col items-center justify-center">
                   <span className="font-display-lg text-[24px] text-on-surface leading-none font-bold">85%</span>
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center">
                   <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                   <span className="font-label-md text-label-md text-on-surface-variant w-20">On Track</span>
                   <span className="font-body-md text-body-md font-medium text-on-surface ml-auto">42</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-2 h-2 rounded-full bg-error mr-2"></span>
                   <span className="font-label-md text-label-md text-on-surface-variant w-20">Overdue</span>
                   <span className="font-body-md text-body-md font-medium text-on-surface ml-auto">3</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-2 h-2 rounded-full bg-outline-variant mr-2"></span>
                   <span className="font-label-md text-label-md text-on-surface-variant w-20">Skipped</span>
                   <span className="font-body-md text-body-md font-medium text-on-surface ml-auto">1</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Calendar Sidebar */}
           <CalendarSidebar
             date={date}
             setDate={setDate}
             technicianFilter={technicianFilter}
             setTechnicianFilter={setTechnicianFilter}
             technicians={technicians}
             hasEvents={hasEvents}
           />

           {/* Upcoming PMs List */}
           <div className="bg-surface-container-lowest rounded-xl deep-shadow p-card_padding border border-transparent flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Upcoming</h3>
               <button className="text-primary font-label-md text-label-md hover:underline decoration-2 underline-offset-4">View All</button>
             </div>
             <div className="space-y-4 overflow-y-auto pr-2 -mr-2">
               {filteredEvents.slice(0, 3).map((event, i) => (
                 <div key={i} className="group p-4 rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/20 cursor-pointer">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center space-x-2">
                       <span className="w-2 h-2 rounded-full bg-primary"></span>
                       <span className="font-label-sm text-label-sm text-primary bg-primary/10 px-2 py-0.5 rounded">Routine</span>
                     </div>
                     <span className="font-label-sm text-label-sm text-on-surface-variant">
                       {event.date.toLocaleDateString("default", { month: "short", day: "numeric" })}
                     </span>
                   </div>
                   <h4 className="font-label-md text-[16px] text-on-surface mb-1">{event.title}</h4>
                   <p className="font-body-md text-[14px] text-on-surface-variant mb-3">{event.technician}</p>
                   <div className="flex items-center text-primary font-label-sm text-label-sm opacity-0 group-hover:opacity-100 transition-opacity">
                     View Details <MaterialIcon name="arrow_forward" className="text-[16px] ml-1" />
                   </div>
                 </div>
               ))}
               {filteredEvents.length === 0 && (
                 <p className="font-body-md text-body-md text-on-surface-variant text-center py-4">No upcoming events.</p>
               )}
             </div>
           </div>
         </div>
       </div>
     </div>
   </DashboardLayout>
 );
};

export default CalendarPage;
