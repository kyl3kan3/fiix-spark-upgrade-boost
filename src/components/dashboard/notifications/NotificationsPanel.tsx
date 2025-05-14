
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import NotificationsList from "./NotificationsList";
import NotificationsPanelHeader from "./NotificationsPanelHeader";
import NotificationsPanelFooter from "./NotificationsPanelFooter";
import { useNotificationsData } from "@/hooks/dashboard/useNotificationsData";
import { Notification } from "@/services/notificationService";

interface NotificationsPanelProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onNotificationCountChange?: (count: number) => void;
  onNewNotification?: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  isOpen, 
  setIsOpen,
  onNotificationCountChange,
  onNewNotification
}) => {
  const { 
    notifications, 
    loading, 
    loadNotifications, 
    handleMarkAllAsRead, 
    handleDismissNotification,
    getUnreadCount
  } = useNotificationsData(onNotificationCountChange, onNewNotification, isOpen);

  // Close the panel when clicking outside
  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40" onClick={handleBackdropClick} />
      )}
      
      <div 
        className={`fixed right-4 top-20 z-50 w-full max-w-sm transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <Card className="shadow-lg dark:border-gray-700">
          <NotificationsPanelHeader 
            unreadCount={getUnreadCount()} 
            onClose={() => setIsOpen(false)} 
          />
          
          <NotificationsList 
            notifications={notifications}
            loading={loading}
            onDismiss={handleDismissNotification}
          />
          
          <NotificationsPanelFooter 
            unreadCount={getUnreadCount()}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </Card>
      </div>
    </>
  );
};

export default NotificationsPanel;
