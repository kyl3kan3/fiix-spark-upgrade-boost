
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Notification } from "@/services/notifications";
import NotificationItem from "./NotificationItem";

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onDismiss: (id: string) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ 
  notifications, 
  loading, 
  onDismiss 
}) => {
  if (loading) {
    return (
      <div className="max-h-[400px] overflow-y-auto">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="max-h-[400px] overflow-y-auto">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <p>No new notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default NotificationsList;
