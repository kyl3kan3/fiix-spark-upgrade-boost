
import { supabase } from "@/integrations/supabase/client";

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

// Function to send an in-app notification
export const sendInAppNotification = async (
  title: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body,
      type: 'in_app',
      reference_id: referenceId
    });
  
  if (error) throw error;
};

// Function to send an email notification
export const sendEmailNotification = async (
  to: string,
  subject: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-email", {
    body: {
      to,
      subject,
      body,
      userId,
      notificationType: 'email',
      referenceId
    }
  });
  
  if (error) throw error;

  // Also store in notifications table
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: subject,
      body,
      type: 'email',
      reference_id: referenceId
    });
};

// Function to send an SMS notification
export const sendSmsNotification = async (
  to: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-sms", {
    body: {
      to,
      body,
      userId,
      notificationType: 'sms',
      referenceId
    }
  });
  
  if (error) throw error;

  // Also store in notifications table
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: "SMS Notification",
      body,
      type: 'sms',
      reference_id: referenceId
    });
};

// Function to send a push notification
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-push", {
    body: {
      token,
      title,
      body,
      userId,
      notificationType: 'push',
      referenceId
    }
  });
  
  if (error) throw error;

  // Also store in notifications table
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body,
      type: 'push',
      reference_id: referenceId
    });
};

// Function to update the Dashboard to use this new notification system
export const setupPushNotifications = async (): Promise<void> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support push notifications");
    return;
  }

  const permission = await Notification.requestPermission();
  
  if (permission !== "granted") {
    console.log("Notification permission not granted");
    return;
  }

  try {
    // In a real implementation, you would use a service worker to register for push notifications
    // For simplicity, we're just generating a mock token here
    const mockToken = `web-${Math.random().toString(36).substring(2, 15)}`;
    await registerDeviceToken(mockToken, 'web');
    console.log("Push notification token registered");
  } catch (error) {
    console.error("Failed to register for push notifications:", error);
  }
};

// Function to initialize and configure the notification service
export const initNotificationService = async (): Promise<void> => {
  try {
    // Check if user is logged in
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (!user) return;
    
    // Set up real-time listener for notifications
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          // Show notification
          if (newNotification.type === 'in_app' && ("Notification" in window)) {
            new Notification(newNotification.title, {
              body: newNotification.body,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    // Return function to clean up
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error("Error initializing notification service:", error);
  }
};
