
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon, ClipboardCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import InspectionsList from "@/components/inspections/InspectionsList";
import { InspectionsCalendarView } from "@/components/inspections/InspectionsCalendarView";
import { useInspections } from "@/hooks/useInspections";
import QueryErrorState from "@/components/common/QueryErrorState";
import { isToday, isSameMonth } from "date-fns";

const InspectionsPage = () => {
 const navigate = useNavigate();
 const [filters, setFilters] = useState({
 search: "",
 status: "all",
 type: "all",
 assignee: "all",
 });

 const { inspections, loading, error, refreshInspections } = useInspections();

 const now = new Date();
 const isOverdue = (i: (typeof inspections)[number]) =>
 i.status === "scheduled" && new Date(i.scheduledDate) < now;

 const filteredInspections = inspections.filter((inspection) => {
 const matchesSearch = !filters.search ||
 inspection.title.toLowerCase().includes(filters.search.toLowerCase()) ||
 inspection.description?.toLowerCase().includes(filters.search.toLowerCase());

 const matchesStatus =
 filters.status === "all" ||
 (filters.status === "failed"
 ? isOverdue(inspection)
 : inspection.status === filters.status && !(filters.status === "scheduled" && isOverdue(inspection)));
 const matchesAssignee = filters.assignee === "all" || inspection.assignedTo === filters.assignee;

 return matchesSearch && matchesStatus && matchesAssignee;
 });

 const scheduledCount = inspections.filter(
 (i) => i.status === "scheduled" && isToday(new Date(i.scheduledDate)),
 ).length;
 const overdueCount = inspections.filter(isOverdue).length;
 const completedThisMonth = inspections.filter(
 (i) => i.status === "completed" && i.completedDate && isSameMonth(new Date(i.completedDate), now),
 );
 const completedCount = completedThisMonth.length;
 const monthItems = completedThisMonth.flatMap((i) => i.items).filter((item) => item.passed !== null);
 const passRate = monthItems.length
 ? Math.round((monthItems.filter((item) => item.passed).length / monthItems.length) * 100)
 : null;

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
 <span className="text-xs font-bold text-muted-foreground">{passRate !== null ? `Pass rate: ${passRate}%` : "This month"}</span>
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
 {error ? (
 <QueryErrorState title="Couldn't load check-ups" error={error} onRetry={() => refreshInspections()} />
 ) : (
 <InspectionsList inspections={filteredInspections} loading={loading} />
 )}
 </TabsContent>

 <TabsContent value="calendar" className="mt-0">
 <InspectionsCalendarView inspections={filteredInspections} />
 </TabsContent>
 </Tabs>
 </div>
 </DashboardLayout>
 );
};

export default InspectionsPage;
