
import { useState, useEffect } from "react";
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

export const useSettingsState = () => {
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

  // Load saved preferences on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem('notificationPreferences');
    if (storedPreferences) {
      setNotificationPreferences(JSON.parse(storedPreferences));
    }

    const storedDisplaySettings = localStorage.getItem('displaySettings');
    if (storedDisplaySettings) {
      setDisplaySettings(JSON.parse(storedDisplaySettings));
    }

    const storedLayout = localStorage.getItem('dashboardLayout');
    if (storedLayout) {
      setDashboardLayout(storedLayout);
    }
  }, []);

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
    const updatedSettings = displaySettings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    
    setDisplaySettings(updatedSettings);
    
    const setting = displaySettings.find(s => s.id === id);
    if (setting) {
      toast.success(`${setting.title} ${!setting.enabled ? 'enabled' : 'disabled'}`);
      
      // Apply dark mode change immediately if it's toggled
      if (id === "darkMode") {
        applyDarkModeChange(!setting.enabled);
      }
      
      // Save display settings immediately to localStorage
      localStorage.setItem('displaySettings', JSON.stringify(updatedSettings));
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
    // Save all settings to localStorage
    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
    localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
    localStorage.setItem('dashboardLayout', dashboardLayout);
    
    toast.success("Settings saved successfully");
    setHasPendingChanges(false);
  };

  const handleResetSetup = () => {
    // Confirm before resetting
    if (window.confirm('Are you sure you want to reset the setup wizard? This will clear all setup data.')) {
      localStorage.removeItem('maintenease_setup_complete');
      toast.success('Setup wizard has been reset. You can now access the setup page again.');
    }
  };

  return {
    notificationPreferences,
    displaySettings,
    dashboardLayout,
    hasPendingChanges,
    handleNotificationToggle,
    handleDisplaySettingToggle,
    handleLayoutChange,
    handleSaveSettings,
    handleResetSetup
  };
};
