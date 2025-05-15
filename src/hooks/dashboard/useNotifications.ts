import { useState, useEffect } from "react";
import { getUserNotifications } from "@/services/notifications";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotificationsCount = async () => {
    setIsLoading(true);
    try {
      const notifications = await getUserNotifications();
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsCount();
  }, []);

  return {
    unreadCount,
    setUnreadCount,
    isLoading,
    fetchNotificationsCount
  };
}
