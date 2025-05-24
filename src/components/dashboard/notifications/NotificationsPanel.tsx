
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import NotificationsList from "./NotificationsList";
import NotificationsPanelHeader from "./NotificationsPanelHeader";
import NotificationsPanelFooter from "./NotificationsPanelFooter";
import { useNotificationsData } from "@/hooks/dashboard/useNotificationsData";
import type { Notification } from "@/services/notifications";

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
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    loading, 
    loadNotifications, 
    handleMarkAllAsRead, 
    handleDismissNotification,
    getUnreadCount
  } = useNotificationsData(onNotificationCountChange, onNewNotification, isOpen);

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 backdrop-blur-[2px] animate-fade-in"
          aria-hidden="true" 
        />
      )}
      
      <div 
        ref={panelRef}
        className={`fixed right-4 top-20 z-50 w-full max-w-sm transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications Panel"
      >
        <Card className="shadow-lg dark:border-gray-700 animate-scale-in overflow-hidden">
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
