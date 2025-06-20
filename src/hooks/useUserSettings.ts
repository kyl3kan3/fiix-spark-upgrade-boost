
import { useEffect } from "react";
import { useUserSettingsCore } from "./useUserSettings/useUserSettingsCore";
import { useUserSettingsActions } from "./useUserSettings/useUserSettingsActions";

export const useUserSettings = () => {
  const {
    settings,
    isLoading,
    isSaving,
    loadSettings,
    saveSettings,
    setSettings
  } = useUserSettingsCore();

  const actions = useUserSettingsActions({
    isSaving,
    setIsSaving: () => {}, // This will be handled by the core hook
    setSettings
  });

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    refreshSettings: loadSettings,
    ...actions
  };
};
