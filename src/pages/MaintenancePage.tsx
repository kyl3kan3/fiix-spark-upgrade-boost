import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreventiveMaintenanceContent from "@/components/features/PreventiveMaintenanceContent";
import UnplannedMaintenanceContent from "@/components/features/UnplannedMaintenanceContent";
import { MaterialIcon } from "@/components/ui/material-icon";

const MaintenancePage = () => {
 const [activeTab, setActiveTab] = useState("preventive");

 return (
   <DashboardLayout>
     <Helmet>
       <title>PM Scheduler | MaintenEase</title>
       <meta name="description" content="Manage and track your preventative maintenance schedules to ensure optimal asset longevity and compliance." />
       <link rel="canonical" href="https://maintenease.com/maintenance" />
     </Helmet>

     {/* Page Content */}
     <div className="p-container_padding">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
         <div>
           <h1 className="font-headline-lg text-headline-lg text-primary mb-2">PM Scheduler</h1>
           <p className="text-on-surface-variant max-w-lg">
             Manage and track your preventative maintenance schedules to ensure optimal asset longevity and compliance.
           </p>
         </div>
         <div className="flex gap-3">
           <button className="px-6 py-2.5 rounded-lg border border-outline-variant text-secondary font-label-md flex items-center gap-2 hover:bg-surface-variant/20 transition-all">
             <MaterialIcon name="ios_share" className="text-xl" />
             Export
           </button>
           <button className="px-6 py-2.5 rounded-lg bg-primary text-white font-label-md flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
             <MaterialIcon name="add" className="text-xl" />
             Create New Schedule
           </button>
         </div>
       </div>

       <div className="grid grid-cols-12 gap-gutter">
         {/* Left Column: Main List/Table */}
         <div className="col-span-12 lg:col-span-9 space-y-6">
           {/* Tabs */}
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="bg-transparent border-b border-outline-variant/10 w-full justify-start rounded-none h-auto p-0 mb-6 gap-0">
               {[["preventive", "Preventive"], ["unplanned", "Unplanned"]].map(([v, l]) => (
                 <TabsTrigger
                   key={v}
                   value={v}
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-on-surface data-[state=active]:shadow-none px-4 py-3 text-label-md font-label-md text-on-surface-variant hover:text-on-surface -mb-px"
                 >
                   {l}
                 </TabsTrigger>
               ))}
             </TabsList>
             <TabsContent value="preventive" className="mt-0">
               <PreventiveMaintenanceContent />
             </TabsContent>
             <TabsContent value="unplanned" className="mt-0">
               <UnplannedMaintenanceContent />
             </TabsContent>
           </Tabs>
         </div>

         {/* Right Column: Dashboard Summary */}
         <div className="col-span-12 lg:col-span-3 space-y-gutter">
           {/* Schedule Health Card */}
           <div className="bg-white p-card_padding rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border-none">
             <div className="flex justify-between items-start mb-6">
               <h3 className="font-headline-md text-headline-md text-on-surface">Schedule Health</h3>
               <MaterialIcon name="analytics" className="text-primary" />
             </div>
             <div className="flex flex-col items-center py-4">
               {/* Progress Ring */}
               <div className="relative w-40 h-40">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle className="text-outline-variant/10" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8"></circle>
                   <circle
                     className="text-primary transition-all duration-1000 ease-out"
                     cx="80" cy="80" fill="transparent" r="70" stroke="currentColor"
                     strokeDasharray="440" strokeDashoffset="44" strokeWidth="8"
                   ></circle>
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="font-headline-md text-display-lg text-primary leading-none">90<span className="text-2xl">%</span></span>
                   <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">Uptime Goal</span>
                 </div>
               </div>
             </div>
             <div className="mt-6 space-y-3">
               <div className="flex justify-between items-center text-label-md">
                 <span className="text-on-surface-variant">On-Time Completion</span>
                 <span className="font-bold text-on-surface">94%</span>
               </div>
               <div className="w-full bg-outline-variant/10 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-primary h-full w-[94%]"></div>
               </div>
               <div className="flex justify-between items-center text-label-md pt-2">
                 <span className="text-on-surface-variant">Compliance Rate</span>
                 <span className="font-bold text-on-surface">88%</span>
               </div>
               <div className="w-full bg-outline-variant/10 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-surface-tint h-full w-[88%]"></div>
               </div>
             </div>
             <button className="w-full mt-8 py-3 rounded-lg bg-surface-container text-primary font-bold text-label-md hover:bg-surface-container-high transition-colors">
               Full Analytics Report
             </button>
           </div>

           {/* Mini Stats */}
           <div className="grid grid-cols-1 gap-4">
             <div className="bg-white p-card_padding rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border-none hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all cursor-pointer group">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-error-container/50 flex items-center justify-center text-error">
                   <MaterialIcon name="warning" />
                 </div>
                 <div>
                   <div className="text-display-lg font-headline-md leading-none text-on-surface">04</div>
                   <div className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Critical Overdue</div>
                 </div>
               </div>
             </div>
             <div className="bg-white p-card_padding rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border-none hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all cursor-pointer group">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                   <MaterialIcon name="event_repeat" />
                 </div>
                 <div>
                   <div className="text-display-lg font-headline-md leading-none text-on-surface">22</div>
                   <div className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Next 7 Days</div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </DashboardLayout>
 );
};

export default MaintenancePage;
