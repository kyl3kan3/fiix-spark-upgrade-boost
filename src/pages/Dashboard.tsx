
import React, { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OverviewTab from '@/components/dashboard/tabs/OverviewTab';
import AnalyticsTab from '@/components/dashboard/tabs/AnalyticsTab';
import TasksTab from '@/components/dashboard/tabs/TasksTab';
import SettingsTab from '@/components/dashboard/tabs/SettingsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavbarApp from '@/components/NavbarApp';

const Dashboard: React.FC = () => {
  // Check stored dark mode preference on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('displaySettings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      const darkModeSetting = settings.find((s: any) => s.id === "darkMode");
      if (darkModeSetting && darkModeSetting.enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col w-full transition-colors">
        <NavbarApp />
        
        <div className="container mx-auto px-4 py-8">
          <DashboardHeader />
          
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="mb-6 dark:bg-gray-800 dark:text-gray-300">
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
