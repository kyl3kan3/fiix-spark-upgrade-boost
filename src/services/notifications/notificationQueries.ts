
import { supabase } from "@/integrations/supabase/client";
import {
 AdminEmailLogEntry,
 EmailDeliveryEvent,
 Notification,
 NotificationPreference,
 UserEmailLogEntry,
} from "./types";

// Function to get user notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
 const { data, error } = await supabase
 .from('notifications')
 .select('*')
 .order('created_at', { ascending: false });
 
 if (error) throw error;
 
 // Cast the type to ensure it matches our interface
 return (data as Notification[]) || [];
};

// Function to get user notification preferences
export const getUserNotificationPreferences = async (): Promise<NotificationPreference | null> => {
 const { data, error } = await supabase
 .from('notification_preferences')
 .select('*')
 .single();
 
 if (error) {
 if (error.code === 'PGRST116') { // No rows returned
 return null;
 }
 throw error;
 }
 
 // Cast the digest_frequency to ensure it matches our expected type
 const typedData = data as unknown as NotificationPreference;
 return typedData;
};

// Function to get a specific user's notification preferences (null when none exist yet)
export const getNotificationPreferencesByUserId = async (userId: string): Promise<NotificationPreference | null> => {
 const { data, error } = await supabase
 .from('notification_preferences')
 .select('*')
 .eq('user_id', userId)
 .maybeSingle();

 if (error) throw error;

 return (data as unknown as NotificationPreference) ?? null;
};

// Input shape for upserting the current user's notification preferences
export interface NotificationPreferenceUpsertInput {
 user_id: string;
 email_enabled: boolean;
 push_enabled: boolean;
 email_address: string | null;
 updated_at: string;
}

// Function to create-or-update a user's notification preferences (keyed by user_id)
export const upsertNotificationPreferences = async (prefs: NotificationPreferenceUpsertInput): Promise<void> => {
 const { error } = await supabase
 .from('notification_preferences')
 .upsert(prefs, { onConflict: 'user_id' });

 if (error) throw error;
};

// Function to update user notification preferences
export const updateNotificationPreferences = async (preferences: Partial<NotificationPreference>): Promise<void> => {
 const { error } = await supabase
 .from('notification_preferences')
 .update(preferences)
 .eq('user_id', preferences.user_id || '');
 
 if (error) throw error;
};

// Function to mark a notification as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
 const { error } = await supabase
 .from('notifications')
 .update({ read: true })
 .eq('id', id);
 
 if (error) throw error;
};

// Function to mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
 const { error } = await supabase
 .from('notifications')
 .update({ read: true })
 .is('read', false);
 
 if (error) throw error;
};

// Function to delete (clear) all of the current user's notifications
export const clearAllNotifications = async (): Promise<void> => {
 const { data: userData } = await supabase.auth.getUser();
 const userId = userData?.user?.id;
 if (!userId) throw new Error('Not authenticated');

 const { error } = await supabase
 .from('notifications')
 .delete()
 .eq('user_id', userId);

 if (error) throw error;
};

// Function to get the latest email notifications sent to a specific user (their email log)
export const getUserEmailLog = async (userId: string): Promise<UserEmailLogEntry[]> => {
 const { data, error } = await supabase
 .from('notifications')
 .select('id, title, body, created_at, provider_message_id, event_type')
 .eq('user_id', userId)
 .eq('type', 'email')
 .order('created_at', { ascending: false })
 .limit(100);

 if (error) throw error;

 return (data as UserEmailLogEntry[]) || [];
};

// Function to get the latest email notifications across the workspace (admin email log)
export const getAdminEmailLog = async (): Promise<AdminEmailLogEntry[]> => {
 const { data, error } = await supabase
 .from('notifications')
 .select('id, title, created_at, user_id, provider_message_id, event_type, reference_id')
 .eq('type', 'email')
 .not('provider_message_id', 'is', null)
 .order('created_at', { ascending: false })
 .limit(100);

 if (error) throw error;

 return (data as AdminEmailLogEntry[]) || [];
};

// Function to get provider delivery events for a set of sent emails
export const getEmailEventsByMessageIds = async (providerMessageIds: string[]): Promise<EmailDeliveryEvent[]> => {
 const { data, error } = await supabase
 .from('email_events')
 .select('id, provider_message_id, event_type, recipient_email, occurred_at')
 .in('provider_message_id', providerMessageIds)
 .order('occurred_at', { ascending: false });

 if (error) throw error;

 return (data as EmailDeliveryEvent[]) || [];
};

// Function to register a device token for push notifications
export const registerDeviceToken = async (token: string, deviceType: 'web' | 'ios' | 'android'): Promise<void> => {
 const { data: user } = await supabase.auth.getUser();
 
 if (!user?.user?.id) {
 throw new Error('User not authenticated');
 }

 // Check if token already exists
 const { data: existingToken } = await supabase
 .from('device_tokens')
 .select('*')
 .eq('token', token)
 .eq('user_id', user.user.id)
 .single();

 if (existingToken) {
 // Update last used timestamp
 const { error } = await supabase
 .from('device_tokens')
 .update({ last_used_at: new Date().toISOString() })
 .eq('id', existingToken.id);
 
 if (error) throw error;
 } else {
 // Insert new token
 const { error } = await supabase
 .from('device_tokens')
 .insert({
 user_id: user.user.id,
 token,
 device_type: deviceType
 });
 
 if (error) throw error;
 }
};
