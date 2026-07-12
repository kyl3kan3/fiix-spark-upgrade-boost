
import { useState, useEffect, useCallback, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
 getUserNotifications, 
 markNotificationAsRead, 
 markAllNotificationsAsRead,
 clearAllNotifications,
 type Notification
} from "@/services/notifications";

export function useNotificationsData(
 onNotificationCountChange?: (count: number) => void,
 onNewNotification?: () => void,
 isOpen?: boolean
) {
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [loading, setLoading] = useState(true);
 const channelRef = useRef<RealtimeChannel | null>(null);
 const notificationsRef = useRef<Notification[]>([]);

 useEffect(() => {
 notificationsRef.current = notifications;
 }, [notifications]);

 const loadNotifications = useCallback(async () => {
 setLoading(true);
 try {
 const notificationsData = await getUserNotifications();
 notificationsRef.current = notificationsData;
 setNotifications(notificationsData);
 onNotificationCountChange?.(notificationsData.filter(n => !n.read).length);
 } catch (error) {
 console.error("Error loading notifications:", error);
 toast.error("Failed to load notifications");
 } finally {
 setLoading(false);
 }
 }, [onNotificationCountChange]);

 // Setup notification listener
 const setupNotificationListener = useCallback(async (isCancelled?: () => boolean) => {
 const { data } = await supabase.auth.getUser();
 const user = data?.user;
 if (!user) return;
  if (isCancelled?.()) return;
  // Remove any prior channel before creating a new one (StrictMode double-invoke safety)
  if (channelRef.current) {
  await supabase.removeChannel(channelRef.current);
  channelRef.current = null;
  }

 const channel = supabase
  .channel(`notifications-changes-${user.id}-${Math.random().toString(36).slice(2, 8)}`)
 .on(
 'postgres_changes',
 {
 event: 'INSERT',
 schema: 'public',
 table: 'notifications',
 filter: `user_id=eq.${user.id}`
 },
 (payload) => {
 // Add new notification to the list
 const newNotification = payload.new as Notification;
 const nextNotifications = [newNotification, ...notificationsRef.current];
 notificationsRef.current = nextNotifications;
 setNotifications(nextNotifications);
 
 // Update unread count
 onNotificationCountChange?.(nextNotifications.filter(n => !n.read).length);

 // Show toast if notification panel is closed
 if (!isOpen) {
 toast(newNotification.title, {
 description: newNotification.body,
 duration: 5000,
 className: "animate-fade-in bg-card/90 /90 shadow-lg border border-primary/30",
 // Sonner allows custom actions
 action: {
 label: "View",
 onClick: () => {
 // This will be handled by the parent component
 // since we don't have direct access to setIsOpen here
 }
 }
 });
 // Play notification sound via callback prop
 if (typeof onNewNotification === "function") {
 onNewNotification();
 }
 }
 }
 )
 .subscribe();

 channelRef.current = channel;
 }, [isOpen, onNewNotification, onNotificationCountChange]);

 // Load notifications when the panel opens.
 useEffect(() => {
 if (isOpen) void loadNotifications();
 }, [isOpen, loadNotifications]);

 // Keep the realtime listener synchronized with the latest callbacks and panel state.
 useEffect(() => {
 let cancelled = false;
 void setupNotificationListener(() => cancelled);
 return () => {
 cancelled = true;
 if (channelRef.current) {
 void supabase.removeChannel(channelRef.current);
 channelRef.current = null;
 }
 };
 }, [setupNotificationListener]);

 const handleMarkAllAsRead = async () => {
 const unreadCount = getUnreadCount();
 if (unreadCount === 0) return;
 
 try {
 await markAllNotificationsAsRead();
 const updatedNotifications = notificationsRef.current.map(n => ({ ...n, read: true }));
 notificationsRef.current = updatedNotifications;
 setNotifications(updatedNotifications);
 toast.success("All notifications marked as read");
 if (onNotificationCountChange) {
 onNotificationCountChange(0);
 }
 } catch (error) {
 console.error("Error marking notifications as read:", error);
 toast.error("Failed to mark notifications as read");
 }
 };

 const handleDismissNotification = async (id: string) => {
 try {
 await markNotificationAsRead(id);
 const updatedNotifications = notificationsRef.current.map(n =>
 n.id === id ? { ...n, read: true } : n
 );
 notificationsRef.current = updatedNotifications;
 setNotifications(updatedNotifications);
 if (onNotificationCountChange) {
 const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
 onNotificationCountChange(newUnreadCount);
 }
 } catch (error) {
 console.error("Error dismissing notification:", error);
 toast.error("Failed to dismiss notification");
 }
 };

 const handleClearAll = async () => {
 if (notifications.length === 0) return;
 try {
 await clearAllNotifications();
 notificationsRef.current = [];
 setNotifications([]);
 if (onNotificationCountChange) onNotificationCountChange(0);
 toast.success("All notifications cleared");
 } catch (error) {
 console.error("Error clearing notifications:", error);
 toast.error("Failed to clear notifications");
 }
 };

 const getUnreadCount = useCallback(() => {
 return notifications.filter(n => !n.read).length;
 }, [notifications]);

 return {
 notifications,
 loading,
 loadNotifications,
 handleMarkAllAsRead,
 handleDismissNotification,
 handleClearAll,
 getUnreadCount
 };
}
