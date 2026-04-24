
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import TasksTab from "@/components/dashboard/tabs/TasksTab";
import AnalyticsTab from "@/components/dashboard/tabs/AnalyticsTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              Welcome back. Here's what's happening with your operations.
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 mb-6 min-w-[300px] bg-muted/60 p-1 h-11">
              <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Tasks</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Analytics</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-0">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-0">
            <TasksTab />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsTab />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
