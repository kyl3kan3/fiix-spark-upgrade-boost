
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

interface NotificationsPanelHeaderProps {
  unreadCount: number;
  onClose: () => void;
}

const NotificationsPanelHeader: React.FC<NotificationsPanelHeaderProps> = ({ 
  unreadCount, 
  onClose 
}) => {
  return (
    <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center">
        <Bell className="h-5 w-5 text-maintenease-500 mr-2" />
        <h3 className="font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center pulse animate-pulse" style={{ animationDuration: "1.2s" }}>
            {unreadCount}
          </span>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NotificationsPanelHeader;
