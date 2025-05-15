
import { supabase } from "@/integrations/supabase/client";
import type { Notification as NotificationType } from "./types";

// Function to setup push notifications
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

// Function to register a device token for push notifications (local function used by setupPushNotifications)
const registerDeviceToken = async (token: string, deviceType: 'web' | 'ios' | 'android'): Promise<void> => {
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

// Function to initialize and configure the notification service
export const initNotificationService = async (): Promise<(() => void) | undefined> => {
  try {
    // Check if user is logged in
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (!user) return undefined;
    
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
          const newNotification = payload.new as NotificationType;
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
    return undefined;
  }
};
