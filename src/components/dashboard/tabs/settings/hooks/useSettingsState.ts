
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";

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
  const { theme, setTheme } = useTheme();
  const { 
    settings, 
    isLoading, 
    isSaving, 
    updateNotificationPreferences, 
    updateDisplaySettings, 
    updateDashboardLayout 
  } = useUserSettings();
  
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    { id: 1, title: "Email Notifications", description: "Receive email notifications for work orders", enabled: true },
    { id: 2, title: "Push Notifications", description: "Receive push notifications on your browser", enabled: false },
    { id: 3, title: "SMS Notifications", description: "Receive text message alerts for critical issues", enabled: false },
  ]);

  const [displaySettings, setDisplaySettings] = useState<DisplaySetting[]>([
    { id: "compactMode", title: "Compact Mode", description: "Use compact layout for better space utilization", enabled: false },
  ]);

  const [dashboardLayout, setDashboardLayout] = useState("Default");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Load settings from database when available
  useEffect(() => {
    if (settings) {
      // Update notification preferences from database
      const updatedNotiPrefs = notificationPreferences.map(pref => {
        switch (pref.id) {
          case 1:
            return { ...pref, enabled: settings.notification_preferences.email_notifications };
          case 2:
            return { ...pref, enabled: settings.notification_preferences.push_notifications };
          case 3:
            return { ...pref, enabled: settings.notification_preferences.sms_notifications };
          default:
            return pref;
        }
      });
      setNotificationPreferences(updatedNotiPrefs);

      // Update display settings from database
      const updatedDisplaySettings = displaySettings.map(setting => {
        if (setting.id === "compactMode") {
          return { ...setting, enabled: settings.display_settings.compact_mode };
        }
        return setting;
      });
      setDisplaySettings(updatedDisplaySettings);

      // Update dashboard layout
      setDashboardLayout(settings.dashboard_layout);
    }
  }, [settings]);

  const handleNotificationToggle = async (id: number) => {
    const updatedPrefs = notificationPreferences.map(pref => 
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    );
    setNotificationPreferences(updatedPrefs);
    
    // Save to database
    const preference = updatedPrefs.find(p => p.id === id);
    if (preference) {
      try {
        const dbPrefs = {
          email_notifications: updatedPrefs.find(p => p.id === 1)?.enabled || false,
          push_notifications: updatedPrefs.find(p => p.id === 2)?.enabled || false,
          sms_notifications: updatedPrefs.find(p => p.id === 3)?.enabled || false,
        };
        await updateNotificationPreferences(dbPrefs);
      } catch (error) {
        // Revert on error
        setNotificationPreferences(notificationPreferences);
      }
    }
  };

  const handleDisplaySettingToggle = async (id: string) => {
    if (id === 'darkMode') {
      // Dark mode is handled by the theme provider
      return;
    }
    
    const updatedSettings = displaySettings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    setDisplaySettings(updatedSettings);
    
    // Save to database
    const setting = updatedSettings.find(s => s.id === id);
    if (setting) {
      try {
        const dbSettings = {
          compact_mode: updatedSettings.find(s => s.id === "compactMode")?.enabled || false,
          dark_mode: false, // This is handled by theme provider
        };
        await updateDisplaySettings(dbSettings);
      } catch (error) {
        // Revert on error
        setDisplaySettings(displaySettings);
      }
    }
  };

  const handleLayoutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayout = e.target.value;
    setDashboardLayout(newLayout);
    
    try {
      await updateDashboardLayout(newLayout);
    } catch (error) {
      // Revert on error
      setDashboardLayout(dashboardLayout);
    }
  };

  const handleSaveSettings = () => {
    // Settings are now saved automatically when changed
    toast.success("Settings are automatically saved");
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
    hasPendingChanges: isSaving,
    handleNotificationToggle,
    handleDisplaySettingToggle,
    handleLayoutChange,
    handleSaveSettings,
    handleResetSetup
  };
};
