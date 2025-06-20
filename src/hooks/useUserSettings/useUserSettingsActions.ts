
import { updateUserSettings } from "@/services/userSettingsService";
import { toast } from "sonner";
import { UserSettings } from "./types";
import { transformDatabaseResponse } from "./transformers";

interface UseUserSettingsActionsProps {
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  setSettings: (settings: UserSettings) => void;
}

export const useUserSettingsActions = ({ isSaving, setIsSaving, setSettings }: UseUserSettingsActionsProps) => {
  
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

  return {
    updateNotificationPreferences,
    updateDisplaySettings,
    updateDashboardLayout,
    markSetupCompleted
  };
};
