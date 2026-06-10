
import { useState, useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Message } from "@/types/chat";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/supabaseHelpers";
import {
  getConversationMessages,
  insertMessage,
  markConversationAsRead,
  subscribeToConversationMessages,
  removeMessagesChannel,
} from "@/services/messageService";

export const useMessages = (recipientId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip if no recipient is selected
    if (!recipientId) {
      setMessages([]);
      return;
    }

    let subscription: RealtimeChannel | null = null;
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        const currentUserId = user?.id;

        if (!currentUserId) return;

        // Get messages between current user and selected recipient (both sent and received)
        const data = await getConversationMessages(currentUserId, recipientId);

        setMessages(data || []);

        // Mark messages from this recipient as read
        markAsRead();

        if (cancelled) return;
        subscription = subscribeToConversationMessages(currentUserId, recipientId, (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
            if (payload.new.sender_id === recipientId) {
              markAsRead();
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
            );
          }
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
      if (subscription) {
        removeMessagesChannel(subscription);
      }
    };
  }, [recipientId]);

  const sendMessage = async (content: string, recipientId: string) => {
    try {
      const user = await getCurrentUser();
      const currentUserId = user?.id;

      if (!currentUserId) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive"
        });
        return;
      }

      await insertMessage(currentUserId, recipientId, content);

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async () => {
    try {
      const user = await getCurrentUser();
      const currentUserId = user?.id;

      if (!currentUserId || !recipientId) return;

      // Mark all messages from this sender to current user as read
      await markConversationAsRead(currentUserId, recipientId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return { messages, sendMessage, markAsRead, loading };
};
