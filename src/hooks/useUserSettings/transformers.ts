
import { UserSettings } from "./types";

// Transform database response to our UserSettings interface
export const transformDatabaseResponse = (dbResponse: any): UserSettings => {
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
