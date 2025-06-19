
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import ProfileInformation from "@/components/profile/ProfileInformation";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleDarkModeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Manage your account and application preferences</p>
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
            <ProfileInformation />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                  </div>
                  <Switch 
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications</p>
                  </div>
                  <Switch 
                    id="pushNotifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                  </div>
                  <Switch 
                    id="darkMode"
                    checked={theme === 'dark'}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>
                <Button>Save Appearance</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
