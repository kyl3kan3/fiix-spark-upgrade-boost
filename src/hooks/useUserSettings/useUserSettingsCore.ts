
import { useState } from "react";
import { getUserSettings, updateUserSettings } from "@/services/userSettingsService";
import { toast } from "sonner";
import { UserSettings } from "./types";
import { transformDatabaseResponse } from "./transformers";

export const useUserSettingsCore = () => {
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

  return {
    settings,
    isLoading,
    isSaving,
    loadSettings,
    saveSettings,
    setSettings
  };
};
