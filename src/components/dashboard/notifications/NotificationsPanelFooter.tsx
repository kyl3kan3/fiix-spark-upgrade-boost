
import React from "react";
import { Button } from "@/components/ui/button";

interface NotificationsPanelFooterProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationsPanelFooter: React.FC<NotificationsPanelFooterProps> = ({ 
  unreadCount, 
  onMarkAllAsRead 
}) => {
  return (
    <div className="p-3 border-t dark:border-gray-700 flex justify-between">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onMarkAllAsRead}
        disabled={unreadCount === 0}
      >
        Mark all as read
      </Button>
      <Button variant="ghost" size="sm">
        View all
      </Button>
    </div>
  );
};

export default NotificationsPanelFooter;
