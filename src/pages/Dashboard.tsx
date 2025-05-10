
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import OverviewTab from "../components/dashboard/tabs/OverviewTab";
import AnalyticsTab from "../components/dashboard/tabs/AnalyticsTab";
import TasksTab from "../components/dashboard/tabs/TasksTab";
import SettingsTab from "../components/dashboard/tabs/SettingsTab";

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Read the tab from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["overview", "analytics", "tasks", "settings"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
  }, [location]);

  // Update the URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    if (value === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", value);
    }
    window.history.pushState({}, "", url);
  };
  
  return (
    <DashboardLayout>
      <DashboardHeader />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
