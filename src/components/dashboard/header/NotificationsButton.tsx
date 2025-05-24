
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationSoundHandle } from "@/components/ui/NotificationSound";

interface NotificationsButtonProps {
  unreadCount: number;
  onClick: () => void;
  notificationSoundRef?: React.RefObject<NotificationSoundHandle>;
}

const NotificationsButton: React.FC<NotificationsButtonProps> = ({
  unreadCount,
  onClick,
  notificationSoundRef
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Notifications"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center pulse"
          aria-label={`${unreadCount} unread notifications`}
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationsButton;
