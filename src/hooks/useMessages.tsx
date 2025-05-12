
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

export const useMessages = (recipientId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip if no recipient is selected
    if (!recipientId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData?.user?.id;

        if (!currentUserId) return;

        // Get messages between current user and selected recipient (both sent and received)
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
          .order("created_at", { ascending: true });

        if (error) throw error;

        setMessages(data);
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

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${recipientId}`
        }, 
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
            );
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [recipientId]);

  const sendMessage = async (content: string, recipientId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      if (!currentUserId) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content,
          read: false
        });

      if (error) throw error;

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
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      if (!currentUserId || !recipientId) return;

      // Mark all messages from this sender to current user as read
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("sender_id", recipientId)
        .eq("recipient_id", currentUserId)
        .eq("read", false);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return { messages, sendMessage, markAsRead, loading };
};
