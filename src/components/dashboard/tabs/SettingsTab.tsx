
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface NotificationPreference {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
}

interface DisplaySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const SettingsTab: React.FC = () => {
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    { id: 1, title: "Email Notifications", description: "Receive email notifications for work orders", enabled: true },
    { id: 2, title: "Push Notifications", description: "Receive push notifications on your browser", enabled: false },
    { id: 3, title: "SMS Notifications", description: "Receive text message alerts for critical issues", enabled: false },
  ]);

  const [displaySettings, setDisplaySettings] = useState<DisplaySetting[]>([
    { id: "darkMode", title: "Dark Mode", description: "Use dark theme for the application", enabled: false },
  ]);

  const [dashboardLayout, setDashboardLayout] = useState("Default");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleNotificationToggle = (id: number) => {
    setNotificationPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
    
    const preference = notificationPreferences.find(p => p.id === id);
    if (preference) {
      toast.success(`${preference.title} ${!preference.enabled ? 'enabled' : 'disabled'}`);
    }
    setHasPendingChanges(true);
  };

  const handleDisplaySettingToggle = (id: string) => {
    setDisplaySettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    
    const setting = displaySettings.find(s => s.id === id);
    if (setting) {
      toast.success(`${setting.title} ${!setting.enabled ? 'enabled' : 'disabled'}`);
      
      // Apply dark mode change immediately if it's toggled
      if (id === "darkMode") {
        applyDarkModeChange(!setting.enabled);
      }
    }
    setHasPendingChanges(true);
  };

  const applyDarkModeChange = (isDarkMode: boolean) => {
    // Apply dark mode to document directly
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDashboardLayout(e.target.value);
    toast.success(`Dashboard layout changed to ${e.target.value}`);
    setHasPendingChanges(true);
  };

  const handleSaveSettings = () => {
    // Here you would typically save settings to backend/localStorage
    // For demonstration, we'll just show a toast and reset the pending changes flag
    toast.success("Settings saved successfully");
    setHasPendingChanges(false);
    
    // You could persist settings to localStorage here
    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
    localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
    localStorage.setItem('dashboardLayout', dashboardLayout);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your preferences and account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 py-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
          <div className="grid gap-4">
            {notificationPreferences.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{pref.title}</p>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() => handleNotificationToggle(pref.id)}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Display Settings</h3>
          <div className="grid gap-4">
            {displaySettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{setting.title}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => handleDisplaySettingToggle(setting.id)}
                  className="cursor-pointer"
                />
              </div>
            ))}
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">Dashboard Layout</p>
                <p className="text-sm text-gray-500">Choose your preferred dashboard layout</p>
              </div>
              <select 
                className="border rounded-md px-2 py-1 text-sm"
                value={dashboardLayout}
                onChange={handleLayoutChange}
              >
                <option>Default</option>
                <option>Compact</option>
                <option>Detailed</option>
              </select>
            </div>
          </div>
        </div>
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
