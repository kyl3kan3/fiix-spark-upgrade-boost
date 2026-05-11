
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NotificationsPanelFooterProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll?: () => void;
  totalCount?: number;
}

const NotificationsPanelFooter: React.FC<NotificationsPanelFooterProps> = ({ 
  unreadCount, 
  onMarkAllAsRead,
  onClearAll,
  totalCount = 0,
}) => {
  const navigate = useNavigate();
  return (
    <div className="p-3 border-t dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
        {onClearAll && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={totalCount === 0}
              >
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all of your notifications. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll}>Clear all</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/notifications/email-log")}>
        View all
      </Button>
    </div>
  );
};

export default NotificationsPanelFooter;
