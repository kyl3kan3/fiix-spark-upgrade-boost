
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

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
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Work Order Updated",
      description: "WO-2023-154 status changed to In Progress",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Maintenance Alert",
      description: "Scheduled maintenance for Line A is due tomorrow",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "System Update",
      description: "New features have been added to the system",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 4,
      title: "Inventory Alert",
      description: "Low inventory for replacement filters",
      time: "Yesterday",
      read: true,
    },
  ]);

  const handleMarkAllAsRead = () => {
    if (getUnreadCount() === 0) return; // Don't do anything if no unread notifications
    
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    toast.success("All notifications marked as read");
    
    // Update the notification count in the parent component
    if (onNotificationCountChange) {
      onNotificationCountChange(0);
    }
  };

  const handleDismissNotification = (id: number) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    
    // Update the notification count after dismissing
    if (onNotificationCountChange) {
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      onNotificationCountChange(newUnreadCount);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Notify parent component of unread count when it changes
  useEffect(() => {
    if (onNotificationCountChange) {
      onNotificationCountChange(getUnreadCount());
    }
  }, [notifications, onNotificationCountChange]);

  // Let's check if notification preferences exist in localStorage
  useEffect(() => {
    const storedPreferences = localStorage.getItem('notificationPreferences');
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences);
      // We could use these preferences to filter which notifications to show
      // For now we'll just log them
      console.log("Loaded notification preferences:", preferences);
    }
  }, []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
      )}
      
      <div 
        className={`fixed right-4 top-20 z-50 w-full max-w-sm transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <Card className="shadow-lg">
          <div className="p-4 border-b flex items-center justify-between">
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
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No new notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b last:border-0 hover:bg-gray-50 ${
                      notification.read ? "" : "bg-blue-50/30"
                    } relative`}
                  >
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
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
          
          <div className="p-3 border-t flex justify-between">
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
