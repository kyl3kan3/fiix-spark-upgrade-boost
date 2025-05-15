
// Types related to the notification system

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  read: boolean;
  created_at: string;
  user_id: string;
  reference_id?: string;
}

export interface NotificationPreference {
  id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  digest_frequency: 'none' | 'daily' | 'weekly';
  email_address?: string;
  phone_number?: string;
  user_id: string;
}

export interface DeviceToken {
  id: string;
  token: string;
  device_type: 'web' | 'ios' | 'android';
  user_id: string;
}
