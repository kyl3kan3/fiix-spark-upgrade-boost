
import React from "react";
import NotificationsPanel from "./notifications/NotificationsPanel";

interface DashboardNotificationsProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onNotificationCountChange?: (count: number) => void;
  onNewNotification?: () => void;
}

const DashboardNotifications: React.FC<DashboardNotificationsProps> = (props) => {
  return <NotificationsPanel {...props} />;
};

export default DashboardNotifications;
