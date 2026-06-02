
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon, ClipboardCheck, AlertTriangle, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import InspectionsList from "@/components/inspections/InspectionsList";
import { InspectionsCalendarView } from "@/components/inspections/InspectionsCalendarView";
import { useInspections } from "@/hooks/useInspections";

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
 <PageHeader
 title="Compliance Dashboard"
 description="Manage scheduled, ongoing, and historical equipment audits."
 actions={
 <Button size="lg" onClick={() => navigate("/inspections/new")}>
 <Plus className="h-5 w-5 mr-1.5" />
 Start New Inspection
 </Button>
 }
 />

 <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
 {/* Stats bento grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:border-primary/10 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-lg bg-primary/10 text-primary">
 <ClipboardCheck className="h-5 w-5" />
 </div>
 <span className="text-xs font-bold text-success">Active today</span>
 </div>
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Scheduled Today</p>
 <h4 className="font-headline text-4xl font-bold text-foreground">
 {String(scheduledCount).padStart(2, "0")}
 </h4>
 </div>
 <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:border-primary/10 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
 <AlertTriangle className="h-5 w-5" />
 </div>
 <span className="text-xs font-bold text-destructive">Action Required</span>
 </div>
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Overdue Tasks</p>
 <h4 className="font-headline text-4xl font-bold text-foreground">
 {String(overdueCount).padStart(2, "0")}
 </h4>
 </div>
 <div className="bg-card border border-border rounded-lg shadow-sm p-6 hover:border-primary/10 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 rounded-lg bg-muted text-primary">
 <CheckCircle2 className="h-5 w-5" />
 </div>
 <span className="text-xs font-bold text-muted-foreground">Monthly Score: 98%</span>
 </div>
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Completed (MTD)</p>
 <h4 className="font-headline text-4xl font-bold text-foreground">
 {String(completedCount).padStart(3, "0")}
 </h4>
 </div>
 </div>

 {/* Filters + view tabs */}
 <div className="flex flex-wrap items-center gap-3">
 <div className="flex bg-muted/60 rounded-lg p-1 gap-0.5">
 {["all", "scheduled", "past due", "completed"].map((tab) => {
 const val = tab === "past due" ? "failed" : tab;
 const active = filters.status === val;
 return (
 <button
 key={tab}
 onClick={() => setFilters((f) => ({ ...f, status: val }))}
 className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all capitalize ${
 active
 ? "bg-card text-primary shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 }`}
 >
 {tab.charAt(0).toUpperCase() + tab.slice(1)}
 </button>
 );
 })}
 </div>

 <div className="ml-auto flex items-center gap-2">
 <Button variant="outline" size="sm" className="text-xs gap-1.5">
 <SlidersHorizontal className="h-3.5 w-3.5" />
 Filter
 </Button>
 </div>
 </div>

 {/* List / Calendar tabs */}
 <Tabs defaultValue="list" className="w-full">
 <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-5 gap-0">
 <TabsTrigger
 value="list"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground -mb-px"
 >
 List View
 </TabsTrigger>
 <TabsTrigger
 value="calendar"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground -mb-px"
 >
 <CalendarIcon className="h-4 w-4 mr-2" />
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
 </div>
 </DashboardLayout>
 );
};

export default InspectionsPage;
