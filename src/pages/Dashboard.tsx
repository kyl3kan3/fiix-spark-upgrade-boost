import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksTab from "@/components/dashboard/tabs/TasksTab";
import AnalyticsTab from "@/components/dashboard/tabs/AnalyticsTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader
        title="Home"
        description="Your daily snapshot — see what needs doing today."
        actions={
          <Button variant="accent" size="lg" onClick={() => navigate("/work-orders/new")}>
            <Plus className="h-5 w-5" strokeWidth={2.4} />
            Report a Problem
          </Button>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6 gap-0">
            {[
              ["overview", "Today"],
              ["tasks", "My Tasks"],
              ["analytics", "Trends"],
              ["settings", "Preferences"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-5 py-3 font-display text-base font-bold text-muted-foreground hover:text-foreground transition-colors -mb-px"
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
