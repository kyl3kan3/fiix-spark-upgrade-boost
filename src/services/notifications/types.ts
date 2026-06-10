
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

// Row shape for a user's own email log (MyEmailLogPage)
export interface UserEmailLogEntry {
 id: string;
 title: string;
 body: string;
 created_at: string;
 provider_message_id: string | null;
 event_type: string | null;
}

// Row shape for the workspace-wide email log (AdminEmailLogPage)
export interface AdminEmailLogEntry {
 id: string;
 title: string;
 created_at: string;
 user_id: string;
 provider_message_id: string | null;
 event_type: string | null;
 reference_id: string | null;
}

// Provider (Resend) webhook delivery event for a sent email
export interface EmailDeliveryEvent {
 id: string;
 provider_message_id: string;
 event_type: string;
 recipient_email: string | null;
 occurred_at: string;
}
