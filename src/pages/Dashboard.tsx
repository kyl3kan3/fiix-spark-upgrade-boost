import React, { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import OverviewTab from '@/components/dashboard/tabs/OverviewTab';
import AnalyticsTab from '@/components/dashboard/tabs/AnalyticsTab';
import TasksTab from '@/components/dashboard/tabs/TasksTab';
import SettingsTab from '@/components/dashboard/tabs/SettingsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initNotificationService, setupPushNotifications } from '@/services/notificationService';

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
    
    // Initialize notification service
    let cleanup: (() => void) | undefined;
    
    const initNotifications = async () => {
      try {
        cleanup = await initNotificationService();
      } catch (error) {
        console.error("Failed to initialize notification service:", error);
      }
    };
    
    initNotifications();
    
    // Ask for push notification permission if not already granted
    setupPushNotifications().catch(error => {
      console.error("Failed to set up push notifications:", error);
    });
    
    // Return cleanup function
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto pb-8">
        <Tabs defaultValue="overview" className="mt-6 animate-entry">
          <TabsList className="mb-6 dark:bg-gray-800 dark:text-gray-300 bg-white/70 backdrop-blur-xl shadow-sm border">
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
    </DashboardLayout>
  );
};

export default Dashboard;
