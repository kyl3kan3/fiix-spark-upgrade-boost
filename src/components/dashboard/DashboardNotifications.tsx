
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  Notification
} from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";

interface DashboardNotificationsProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onNotificationCountChange?: (count: number) => void;
}

const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({ 
  isOpen, 
  setIsOpen,
  onNotificationCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for new notifications
    const { data: { user } } = supabase.auth.getUser();
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
            toast.info(newNotification.title, {
              description: newNotification.body,
              duration: 5000,
              action: {
                label: "View",
                onClick: () => setIsOpen(true)
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notificationsData = await getUserNotifications();
      setNotifications(notificationsData);
      
      // Update unread count
      if (onNotificationCountChange) {
        onNotificationCountChange(notificationsData.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (getUnreadCount() === 0) return; // Don't do anything if no unread notifications
    
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
      
      // Update the notification count in the parent component
      if (onNotificationCountChange) {
        onNotificationCountChange(0);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      
      // Update the notification count after dismissing
      if (onNotificationCountChange) {
        const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
        onNotificationCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast.error("Failed to dismiss notification");
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}
      
      <div 
        className={`fixed right-4 top-20 z-50 w-full max-w-sm transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <Card className="shadow-lg dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-maintenease-500 mr-2" />
              <h3 className="font-medium">Notifications</h3>
              {getUnreadCount() > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getUnreadCount()}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No new notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 ${
                      notification.read ? "" : "bg-blue-50/30 dark:bg-blue-900/20"
                    } relative`}
                  >
                    <div className="flex items-start">
                      {notification.type === 'email' && (
                        <span className="text-blue-500 text-xs px-1.5 py-0.5 bg-blue-100 rounded mr-2">Email</span>
                      )}
                      {notification.type === 'sms' && (
                        <span className="text-green-500 text-xs px-1.5 py-0.5 bg-green-100 rounded mr-2">SMS</span>
                      )}
                      {notification.type === 'push' && (
                        <span className="text-purple-500 text-xs px-1.5 py-0.5 bg-purple-100 rounded mr-2">Push</span>
                      )}
                      {notification.type === 'in_app' && (
                        <span className="text-orange-500 text-xs px-1.5 py-0.5 bg-orange-100 rounded mr-2">App</span>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.body}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 hover:opacity-100 focus:opacity-100"
                      onClick={() => handleDismissNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t dark:border-gray-700 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={getUnreadCount() === 0}
            >
              Mark all as read
            </Button>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DashboardNotifications;
