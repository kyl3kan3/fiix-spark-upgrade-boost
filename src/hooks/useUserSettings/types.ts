
export interface UserSettings {
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
