
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon } from "lucide-react";
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

  // Calendar filters with date range for the calendar view
  const calendarFilters = {
    status: filters.status,
    priority: "all", // Default priority filter
    assignedTo: filters.assignee,
    dateRange: { from: undefined, to: undefined } // Default date range
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Check-Ups"
        description="Routine inspections to keep your equipment safe and working."
        actions={
          <Button variant="accent" size="lg" onClick={() => navigate("/inspections/new")}>
            <Plus className="h-5 w-5" />
            New Check-Up
          </Button>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="bg-secondary rounded-2xl p-1 mb-6 h-auto">
            <TabsTrigger value="list" className="rounded-xl px-5 py-2.5 font-bold text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl px-5 py-2.5 font-bold text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
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
