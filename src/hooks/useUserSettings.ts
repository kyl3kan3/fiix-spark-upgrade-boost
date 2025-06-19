
import { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "@/services/userSettingsService";
import { toast } from "sonner";

interface UserSettings {
  notification_preferences: {
    sms_notifications: boolean;
    push_notifications: boolean;
    email_notifications: boolean;
  };
  display_settings: {
    dark_mode: boolean;
    compact_mode: boolean;
  };
  dashboard_layout: string;
  setup_completed: boolean;
}

// Transform database response to our UserSettings interface
const transformDatabaseResponse = (dbResponse: any): UserSettings => {
  return {
    notification_preferences: typeof dbResponse.notification_preferences === 'object' 
      ? dbResponse.notification_preferences 
      : {
          sms_notifications: false,
          push_notifications: false,
          email_notifications: true
        },
    display_settings: typeof dbResponse.display_settings === 'object'
      ? dbResponse.display_settings
      : {
          dark_mode: false,
          compact_mode: false
        },
    dashboard_layout: dbResponse.dashboard_layout || 'Default',
    setup_completed: dbResponse.setup_completed || false
  };
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const userSettings = await getUserSettings();
      const transformedSettings = transformDatabaseResponse(userSettings);
      setSettings(transformedSettings);
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast.error('Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    setIsSaving(true);
    try {
      const savedSettings = await updateUserSettings(newSettings);
      const transformedSettings = transformDatabaseResponse(savedSettings);
      setSettings(transformedSettings);
      toast.success('Settings saved successfully');
      return transformedSettings;
    } catch (error) {
      console.error('Error saving user settings:', error);
      toast.error('Failed to save settings');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateNotificationPreferences = async (preferences: UserSettings['notification_preferences']) => {
    setIsSaving(true);
    try {
      const updatedSettings = await updateUserSettings({ notification_preferences: preferences });
      const transformedSettings = transformDatabaseResponse(updatedSettings);
      setSettings(transformedSettings);
      toast.success('Notification preferences updated');
      return transformedSettings;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateDisplaySettings = async (displaySettings: UserSettings['display_settings']) => {
    setIsSaving(true);
    try {
      const updatedSettings = await updateUserSettings({ display_settings: displaySettings });
      const transformedSettings = transformDatabaseResponse(updatedSettings);
      setSettings(transformedSettings);
      toast.success('Display settings updated');
      return transformedSettings;
    } catch (error) {
      console.error('Error updating display settings:', error);
      toast.error('Failed to update display settings');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateDashboardLayout = async (layout: string) => {
    setIsSaving(true);
    try {
      const updatedSettings = await updateUserSettings({ dashboard_layout: layout });
      const transformedSettings = transformDatabaseResponse(updatedSettings);
      setSettings(transformedSettings);
      toast.success('Dashboard layout updated');
      return transformedSettings;
    } catch (error) {
      console.error('Error updating dashboard layout:', error);
      toast.error('Failed to update dashboard layout');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const markSetupCompleted = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = await updateUserSettings({ setup_completed: true });
      const transformedSettings = transformDatabaseResponse(updatedSettings);
      setSettings(transformedSettings);
      return transformedSettings;
    } catch (error) {
      console.error('Error marking setup as completed:', error);
      toast.error('Failed to update setup status');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    updateNotificationPreferences,
    updateDisplaySettings,
    updateDashboardLayout,
    markSetupCompleted,
    refreshSettings: loadSettings,
  };
};
