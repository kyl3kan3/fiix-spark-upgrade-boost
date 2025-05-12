
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { InspectionsList } from "@/components/inspections/InspectionsList";
import { InspectionsCalendarView } from "@/components/inspections/InspectionsCalendarView";
import { InspectionsFilters } from "@/components/inspections/InspectionsFilters";

const InspectionsPage = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState("list");
  const [filterValues, setFilterValues] = useState({
    status: "all",
    priority: "all",
    assignedTo: "all",
    dateRange: { from: undefined, to: undefined },
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCreateNew = () => {
    navigate("/inspections/new");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Inspections | MaintenEase</title>
      </Helmet>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inspections</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Button onClick={handleCreateNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Inspection
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <InspectionsFilters 
            filters={filterValues} 
            setFilters={setFilterValues} 
          />
        )}
        
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <InspectionsList filters={filterValues} />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4">
            <InspectionsCalendarView filters={filterValues} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InspectionsPage;
