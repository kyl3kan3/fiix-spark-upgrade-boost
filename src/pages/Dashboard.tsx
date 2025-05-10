
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import OverviewTab from "../components/dashboard/tabs/OverviewTab";
import AnalyticsTab from "../components/dashboard/tabs/AnalyticsTab";
import TasksTab from "../components/dashboard/tabs/TasksTab";
import SettingsTab from "../components/dashboard/tabs/SettingsTab";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <DashboardLayout>
      <DashboardHeader />
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        
        <TabsContent value="tasks">
          <TasksTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
