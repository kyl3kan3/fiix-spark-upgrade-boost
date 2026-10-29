
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationPreferences from "./settings/NotificationPreferences";
import DisplaySettings from "./settings/DisplaySettings";
import SystemSettings from "./settings/SystemSettings";
import { useSettingsState } from "./settings/hooks/useSettingsState";

const SettingsTab: React.FC = () => {
 const {
 notificationPreferences,
 displaySettings,
 dashboardLayout,
 handleNotificationToggle,
 handleDisplaySettingToggle,
 handleLayoutChange,
 handleResetSetup
 } = useSettingsState();

 return (
 <Card className="transition-colors">
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
 </Card>
 );
};

export default SettingsTab;
