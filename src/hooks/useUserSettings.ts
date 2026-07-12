
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
 setSettings,
 setIsSaving,
 } = useUserSettingsCore();

 const actions = useUserSettingsActions({
 setIsSaving,
 setSettings
 });

 useEffect(() => {
 void loadSettings();
 }, [loadSettings]);

 return {
 settings,
 isLoading,
 isSaving,
 saveSettings,
 refreshSettings: loadSettings,
 ...actions
 };
};
