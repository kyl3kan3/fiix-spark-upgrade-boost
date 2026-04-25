import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksTab from "@/components/dashboard/tabs/TasksTab";
import AnalyticsTab from "@/components/dashboard/tabs/AnalyticsTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();

  return (
    <DashboardLayout>
      <PageHeader
        code={`DSH · ${today}`}
        title="Operations Console"
        description="Live view of work orders, assets, and crew activity across all locations."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              Export
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate("/work-orders/new")}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Work Order
            </Button>
          </>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6 gap-0">
            {[
              ["overview", "Overview"],
              ["tasks", "Tasks"],
              ["analytics", "Analytics"],
              ["settings", "Settings"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 font-display text-sm font-medium text-muted-foreground hover:text-foreground transition-colors -mb-px"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0"><OverviewTab /></TabsContent>
          <TabsContent value="tasks" className="mt-0"><TasksTab /></TabsContent>
          <TabsContent value="analytics" className="mt-0"><AnalyticsTab /></TabsContent>
          <TabsContent value="settings" className="mt-0"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
