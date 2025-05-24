
import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsButton from "./NotificationsButton";
import { NotificationSoundHandle } from "@/components/ui/NotificationSound";

interface HeaderActionsProps {
  unreadNotificationsCount: number;
  toggleNotifications: () => void;
  notificationSoundRef?: React.RefObject<NotificationSoundHandle>;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  unreadNotificationsCount,
  toggleNotifications,
  notificationSoundRef
}) => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/chat">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Chat"
          className="relative"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </Link>
      
      <NotificationsButton 
        unreadCount={unreadNotificationsCount}
        onClick={toggleNotifications}
        notificationSoundRef={notificationSoundRef}
      />
      
      <Link to="/help">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          className="hidden sm:flex"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};

export default HeaderActions;
