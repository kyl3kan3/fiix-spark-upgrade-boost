
import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  id?: string;
  user_id?: string;
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
  };
  display_settings: {
    compact_mode: boolean;
    dark_mode: boolean;
  };
  dashboard_layout: string;
  setup_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export class UserSettingsService {
  static async getUserSettings(): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }

    return data as UserSettings | null;
  }

  static async saveUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const settingsData = {
      user_id: user.id,
      ...settings,
    };

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settingsData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }

    return data as UserSettings;
  }

  static async updateNotificationPreferences(preferences: UserSettings['notification_preferences']): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    
    return this.saveUserSettings({
      ...currentSettings,
      notification_preferences: preferences,
    });
  }

  static async updateDisplaySettings(settings: UserSettings['display_settings']): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    
    return this.saveUserSettings({
      ...currentSettings,
      display_settings: settings,
    });
  }

  static async updateDashboardLayout(layout: string): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    
    return this.saveUserSettings({
      ...currentSettings,
      dashboard_layout: layout,
    });
  }

  static async markSetupCompleted(): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    
    return this.saveUserSettings({
      ...currentSettings,
      setup_completed: true,
    });
  }
}
