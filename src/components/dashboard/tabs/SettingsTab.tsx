
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationPreferences from "./settings/NotificationPreferences";
import DisplaySettings from "./settings/DisplaySettings";
import SystemSettings from "./settings/SystemSettings";
import { useSettingsState } from "./settings/hooks/useSettingsState";

const SettingsTab: React.FC = () => {
  const {
    notificationPreferences,
    displaySettings,
    dashboardLayout,
    hasPendingChanges,
    handleNotificationToggle,
    handleDisplaySettingToggle,
    handleLayoutChange,
    handleSaveSettings,
    handleResetSetup
  } = useSettingsState();

  return (
    <Card className="transition-colors dark:border-gray-700">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your preferences and account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 py-4">
        <NotificationPreferences 
          preferences={notificationPreferences}
          onToggle={handleNotificationToggle}
        />
        
        <DisplaySettings 
          settings={displaySettings}
          dashboardLayout={dashboardLayout}
          onToggle={handleDisplaySettingToggle}
          onLayoutChange={handleLayoutChange}
        />
        
        <SystemSettings onResetSetup={handleResetSetup} />
      </CardContent>
      <CardFooter>
        <Button 
          className={`ml-auto ${hasPendingChanges ? 'bg-maintenease-600 hover:bg-maintenease-700' : 'bg-gray-400 hover:bg-gray-500'}`}
          onClick={handleSaveSettings}
          disabled={!hasPendingChanges}
        >
          {hasPendingChanges ? "Save Settings" : "No Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsTab;
