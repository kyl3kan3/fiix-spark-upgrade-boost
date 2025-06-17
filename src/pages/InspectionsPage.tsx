
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import InspectionsList from "@/components/inspections/InspectionsList";
import { InspectionsCalendarView } from "@/components/inspections/InspectionsCalendarView";
import { useInspections } from "@/hooks/useInspections";

const InspectionsPage = () => {
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
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Inspections</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Schedule and manage equipment inspections</p>
          </div>
          <Link to="/inspections/new">
            <Button className="bg-maintenease-600 hover:bg-maintenease-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">New Inspection</span>
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 min-w-[200px]">
              <TabsTrigger value="list" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">List View</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm">
                <CalendarIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Calendar</span>
                <span className="sm:hidden">Cal</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="mt-0 space-y-4 sm:space-y-6">
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
