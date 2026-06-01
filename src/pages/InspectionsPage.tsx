
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InspectionsList from "@/components/inspections/InspectionsList";
import { InspectionsCalendarView } from "@/components/inspections/InspectionsCalendarView";
import { useInspections } from "@/hooks/useInspections";
import { MaterialIcon } from "@/components/ui/material-icon";

const InspectionsPage = () => {
 const navigate = useNavigate();
 const [filters, setFilters] = useState({
   search: "",
   status: "all",
   type: "all",
   assignee: "all",
 });

 const { inspections, loading } = useInspections();

 const filteredInspections = inspections.filter((inspection) => {
   const matchesSearch = !filters.search ||
     inspection.title.toLowerCase().includes(filters.search.toLowerCase()) ||
     inspection.description?.toLowerCase().includes(filters.search.toLowerCase());

   const matchesStatus = filters.status === "all" || inspection.status === filters.status;
   const matchesAssignee = filters.assignee === "all" || inspection.assignedTo === filters.assignee;

   return matchesSearch && matchesStatus && matchesAssignee;
 });

 const calendarFilters = {
   status: filters.status,
   priority: "all",
   assignedTo: filters.assignee,
   dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
 };

 const scheduledCount = inspections.filter((i) => i.status === "scheduled").length;
 const overdueCount = inspections.filter((i) => i.status === "failed").length;
 const completedCount = inspections.filter((i) => i.status === "completed").length;

 return (
   <DashboardLayout>
     <Helmet>
       <title>Compliance Dashboard | MaintenEase</title>
       <meta name="description" content="Manage scheduled, ongoing, and historical equipment audits." />
       <link rel="canonical" href="https://maintenease.com/inspections" />
     </Helmet>

     {/* Content Area */}
     <div className="p-container_padding max-w-[1400px] mx-auto">
       {/* Header Actions */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <div>
           <h3 className="font-headline-lg text-headline-lg text-on-surface">Compliance Dashboard</h3>
           <p className="text-body-md text-secondary mt-1">Manage scheduled, ongoing, and historical equipment audits.</p>
         </div>
         <button
           onClick={() => navigate("/inspections/new")}
           className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md uppercase tracking-wide shadow-md hover:shadow-lg hover:translate-y-[-2px] active:scale-95 transition-all"
         >
           <MaterialIcon name="add_circle" />
           Start New Inspection
         </button>
       </div>

       {/* Stats Bento Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:border-primary/10 transition-all shadow-sm">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-lg bg-surface-container text-primary">
               <MaterialIcon name="event_available" filled />
             </div>
             <span className="text-label-sm text-success font-bold">Active today</span>
           </div>
           <p className="text-label-md text-secondary uppercase font-bold tracking-wider">Scheduled Today</p>
           <h4 className="text-display-lg font-display-lg text-on-surface">{String(scheduledCount).padStart(2, "0")}</h4>
         </div>
         <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:border-primary/10 transition-all shadow-sm">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-lg bg-error-container text-error">
               <MaterialIcon name="error_outline" filled />
             </div>
             <span className="text-label-sm text-error font-bold">Action Required</span>
           </div>
           <p className="text-label-md text-secondary uppercase font-bold tracking-wider">Overdue Tasks</p>
           <h4 className="text-display-lg font-display-lg text-on-surface">{String(overdueCount).padStart(2, "0")}</h4>
         </div>
         <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:border-primary/10 transition-all shadow-sm">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-lg bg-surface-container-highest text-primary">
               <MaterialIcon name="verified" filled />
             </div>
             <span className="text-label-sm text-on-secondary-container font-bold">Monthly Score: 98%</span>
           </div>
           <p className="text-label-md text-secondary uppercase font-bold tracking-wider">Completed (MTD)</p>
           <h4 className="text-display-lg font-display-lg text-on-surface">{String(completedCount).padStart(3, "0")}</h4>
         </div>
       </div>

       {/* Filters & Views */}
       <div className="flex flex-wrap items-center gap-4 mb-6">
         <div className="flex bg-surface-container rounded-lg p-1">
           {[
             { label: "All", value: "all" },
             { label: "Scheduled", value: "scheduled" },
             { label: "Past Due", value: "failed" },
             { label: "Completed", value: "completed" },
           ].map(({ label, value }) => (
             <button
               key={value}
               onClick={() => setFilters((f) => ({ ...f, status: value }))}
               className={`px-6 py-2 rounded-md font-label-md transition-all ${
                 filters.status === value
                   ? "bg-surface-container-lowest text-primary font-bold shadow-sm"
                   : "text-secondary hover:text-on-surface"
               }`}
             >
               {label}
             </button>
           ))}
         </div>
         <div className="ml-auto flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-lg text-label-md text-secondary hover:bg-surface-container transition-all">
             <MaterialIcon name="filter_list" className="text-[20px]" />
             Filter
           </button>
           <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-lg text-label-md text-secondary hover:bg-surface-container transition-all">
             <MaterialIcon name="sort" className="text-[20px]" />
             Sort
           </button>
         </div>
       </div>

       {/* List / Calendar tabs */}
       <Tabs defaultValue="list" className="w-full">
         <TabsList className="bg-transparent border-b border-outline-variant/20 w-full justify-start rounded-none h-auto p-0 mb-5 gap-0">
           <TabsTrigger
             value="list"
             className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-on-surface data-[state=active]:shadow-none px-4 py-3 text-label-md font-label-md text-secondary hover:text-on-surface -mb-px"
           >
             List View
           </TabsTrigger>
           <TabsTrigger
             value="calendar"
             className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-on-surface data-[state=active]:shadow-none px-4 py-3 text-label-md font-label-md text-secondary hover:text-on-surface -mb-px flex items-center gap-2"
           >
             <MaterialIcon name="calendar_month" className="text-[18px]" />
             Calendar
           </TabsTrigger>
         </TabsList>

         <TabsContent value="list" className="mt-0 space-y-4">
           <InspectionsList inspections={filteredInspections} loading={loading} />
         </TabsContent>

         <TabsContent value="calendar" className="mt-0">
           <InspectionsCalendarView filters={calendarFilters} />
         </TabsContent>
       </Tabs>

       {/* Footer Pagination */}
       {filteredInspections.length > 0 && (
         <div className="mt-10 flex items-center justify-between py-6 border-t border-outline-variant/20">
           <span className="text-label-md text-secondary">
             Showing 1-{Math.min(filteredInspections.length, 12)} of {filteredInspections.length} Inspections
           </span>
           <div className="flex gap-2">
             <button className="p-2 rounded-lg border border-outline-variant/30 text-secondary hover:bg-surface-container transition-all">
               <MaterialIcon name="chevron_left" />
             </button>
             <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-label-md">1</button>
             <button className="p-2 rounded-lg border border-outline-variant/30 text-secondary hover:bg-surface-container transition-all">
               <MaterialIcon name="chevron_right" />
             </button>
           </div>
         </div>
       )}
     </div>
   </DashboardLayout>
 );
};

export default InspectionsPage;
