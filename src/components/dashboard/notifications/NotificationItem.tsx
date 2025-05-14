
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Notification } from "@/services/notificationService";
import NotificationTypeBadge from "./NotificationTypeBadge";

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onDismiss 
}) => {
  return (
    <div 
      className={`p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 ${
        notification.read ? "" : "bg-blue-50/30 dark:bg-blue-900/20"
      } relative`}
    >
      <div className="flex items-start">
        <NotificationTypeBadge type={notification.type} />
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
        onClick={() => onDismiss(notification.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default NotificationItem;
