
import { useState, useEffect } from "react";
import { UserSettingsService, UserSettings } from "@/services/userSettingsService";
import { toast } from "sonner";

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const userSettings = await UserSettingsService.getUserSettings();
      setSettings(userSettings);
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
      const savedSettings = await UserSettingsService.saveUserSettings(newSettings);
      setSettings(savedSettings);
      toast.success('Settings saved successfully');
      return savedSettings;
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
      const updatedSettings = await UserSettingsService.updateNotificationPreferences(preferences);
      setSettings(updatedSettings);
      toast.success('Notification preferences updated');
      return updatedSettings;
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
      const updatedSettings = await UserSettingsService.updateDisplaySettings(displaySettings);
      setSettings(updatedSettings);
      toast.success('Display settings updated');
      return updatedSettings;
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
      const updatedSettings = await UserSettingsService.updateDashboardLayout(layout);
      setSettings(updatedSettings);
      toast.success('Dashboard layout updated');
      return updatedSettings;
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
      const updatedSettings = await UserSettingsService.markSetupCompleted();
      setSettings(updatedSettings);
      return updatedSettings;
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
