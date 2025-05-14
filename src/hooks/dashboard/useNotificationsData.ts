
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  Notification
} from "@/services/notificationService";

export function useNotificationsData(
  onNotificationCountChange?: (count: number) => void,
  onNewNotification?: () => void,
  isOpen?: boolean
) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications when component mounts or when panel is opened
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Set up realtime listener for new notifications
  useEffect(() => {
    // Listen for new notifications
    async function setupNotificationListener() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // Add new notification to the list
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            
            // Update unread count
            if (onNotificationCountChange) {
              onNotificationCountChange(getUnreadCount() + 1);
            }

            // Show toast if notification panel is closed
            if (!isOpen) {
              toast({
                title: newNotification.title,
                description: newNotification.body,
                duration: 5000,
                className: "animate-fade-in bg-white/90 dark:bg-gray-900/90 shadow-lg border border-blue-400/30",
                // Sonner allows custom styles and may be styled further in theme
                action: {
                  label: "View",
                  onClick: () => {
                    // This will be handled by the parent component
                    // since we don't have direct access to setIsOpen here
                  }
                }
              });
              // Play notification sound via callback prop
              if (typeof onNewNotification === "function") {
                onNewNotification();
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    setupNotificationListener();
    // eslint-disable-next-line
  }, [isOpen, onNotificationCountChange, onNewNotification]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notificationsData = await getUserNotifications();
      setNotifications(notificationsData);
      if (onNotificationCountChange) {
        onNotificationCountChange(notificationsData.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (getUnreadCount() === 0) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
        className: "animate-fade-in bg-green-50 dark:bg-green-700 text-green-900 dark:text-green-100"
      });
      if (onNotificationCountChange) {
        onNotificationCountChange(0);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      if (onNotificationCountChange) {
        const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
        onNotificationCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast({
        title: "Error",
        description: "Failed to dismiss notification",
        variant: "destructive"
      });
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return {
    notifications,
    loading,
    loadNotifications,
    handleMarkAllAsRead,
    handleDismissNotification,
    getUnreadCount
  };
}
