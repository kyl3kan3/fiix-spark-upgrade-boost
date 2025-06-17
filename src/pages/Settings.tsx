
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your account and application preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 min-w-[300px]">
              <TabsTrigger value="profile" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Security</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Appearance</span>
                <span className="sm:hidden">Theme</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="profile" className="mt-0">
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Profile Settings</h3>
              <p className="text-sm sm:text-base text-gray-500">Manage your personal information and preferences.</p>
              <div className="mt-6 text-center text-gray-400">
                <p className="text-sm sm:text-base">Profile settings coming soon...</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Notification Preferences</h3>
              <p className="text-sm sm:text-base text-gray-500">Control how and when you receive notifications.</p>
              <div className="mt-6 text-center text-gray-400">
                <p className="text-sm sm:text-base">Notification settings coming soon...</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Security Settings</h3>
              <p className="text-sm sm:text-base text-gray-500">Manage your account security and privacy settings.</p>
              <div className="mt-6 text-center text-gray-400">
                <p className="text-sm sm:text-base">Security settings coming soon...</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-0">
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Appearance Settings</h3>
              <p className="text-sm sm:text-base text-gray-500">Customize the look and feel of your dashboard.</p>
              <div className="mt-6 text-center text-gray-400">
                <p className="text-sm sm:text-base">Appearance settings coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
