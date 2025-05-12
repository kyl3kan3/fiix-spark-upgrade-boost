
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { InspectionsList } from "@/components/inspections/InspectionsList";
import InspectionsFilters from "@/components/inspections/InspectionsFilters";
import InspectionsCalendarView from "@/components/inspections/InspectionsCalendarView";
import DailyChecklist from "@/components/inspections/DailyChecklist";

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

  const handleCreateNew = () => {
    navigate("/new-inspection");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Inspections | MaintenEase</title>
      </Helmet>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Inspections</h1>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" /> New Inspection
            </Button>
          </div>

          <InspectionsFilters filters={filters} setFilters={setFilters} />

          <Tabs value={activeView} onValueChange={setActiveView}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-4">
              <InspectionsList filters={filters} />
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <InspectionsCalendarView />
            </TabsContent>
          </Tabs>
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
