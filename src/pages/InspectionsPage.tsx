
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InspectionsList from "@/components/inspections/InspectionsList";
import { InspectionsFilters } from "@/components/inspections/InspectionsFilters";
import { InspectionsCalendarView } from "@/components/inspections/InspectionsCalendarView";
import DailyChecklist from "@/components/inspections/DailyChecklist";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { useInspections } from "@/hooks/useInspections";

const InspectionsPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>("list");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    assignedTo: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  // Use our custom hook to fetch inspections
  const { inspections, loading, refreshInspections } = useInspections(filters);

  const handleCreateNew = () => {
    navigate("/inspections/new");
  };

  React.useEffect(() => {
    // Show a toast notification about the data being simulated
    toast.info("Using simulated inspection data", {
      description: "Connect to a real data source for production use",
      duration: 5000,
      id: "inspection-mock-data-notice"
    });
  }, []);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Inspections | MaintenEase</title>
      </Helmet>

      <BackToDashboard />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:flex-1 space-y-6">
          {/* Floating top bar with filters - adding proper sticky positioning */}
          <div className="sticky top-0 z-40 pt-4 pb-2 bg-background/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Inspections</h1>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" /> New Inspection
              </Button>
            </div>

            <InspectionsFilters filters={filters} setFilters={setFilters} />

            <Tabs value={activeView} onValueChange={setActiveView} className="mt-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="list" className="mt-4 pt-4">
                <InspectionsList inspections={inspections} loading={loading} />
              </TabsContent>

              <TabsContent value="calendar" className="mt-4 pt-4">
                <InspectionsCalendarView filters={filters} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Daily Checklist Sidebar */}
        <div className="md:w-80 flex-shrink-0">
          <DailyChecklist />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InspectionsPage;
